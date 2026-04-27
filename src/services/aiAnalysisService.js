const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${GEMINI_API_KEY}`;

const memCache = new Map();
const inFlight = new Map();

const STORAGE_PREFIX = 'gemini_analysis_';

function loadFromStorage(key) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    const { result, expiry } = JSON.parse(raw);
    if (Date.now() > expiry) { localStorage.removeItem(STORAGE_PREFIX + key); return null; }
    return result;
  } catch { return null; }
}

function saveToStorage(key, result) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify({
      result,
      expiry: Date.now() + 1000 * 60 * 60 * 24, // 24시간
    }));
  } catch {}
}

export async function analyzeReviews(restaurantName, reviews) {
  if (!GEMINI_API_KEY) throw new Error('VITE_GEMINI_API_KEY가 설정되지 않았습니다.');
  if (!reviews?.length) return null;

  const cacheKey = `${restaurantName}_${reviews.length}`;
  if (memCache.has(cacheKey)) return memCache.get(cacheKey);
  const stored = loadFromStorage(cacheKey);
  if (stored) { memCache.set(cacheKey, stored); return stored; }
  if (inFlight.has(cacheKey)) return inFlight.get(cacheKey);

  const reviewTexts = reviews.slice(0, 20).map((r, i) =>
    `리뷰 ${i + 1} (별점: ${r.rating}/5): ${r.review_text}`
  ).join('\n');

  const prompt = `아래는 "${restaurantName}" 식당의 리뷰입니다.

${reviewTexts}

이 리뷰들을 분석해서 아래 JSON만 반환하세요. 마크다운 없이 순수 JSON만 출력하세요:
{"summary":"한 문장 한국어 요약 (50자 이내)","scores":{"taste":맛점수0-100,"service":서비스점수0-100,"atmosphere":분위기점수0-100}}`;

  const fetchOnce = async () => {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
      }),
    });

    if (response.status === 429) {
      const err = await response.json().catch(() => null);
      const msg = err?.error?.message ?? '';
      const seconds = parseFloat(msg.match(/retry in ([\d.]+)s/i)?.[1] ?? '20');
      await new Promise(r => setTimeout(r, seconds * 1000));
      return fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
        }),
      });
    }

    return response;
  };

  const promise = (async () => {
    try {
      const response = await fetchOnce();

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error?.message || `Gemini API 오류: ${response.status}`);
      }

      const data = await response.json();

      const parts = data?.candidates?.[0]?.content?.parts ?? [];
      const text = parts.filter(p => !p.thought).map(p => p.text ?? '').join('');
      if (!text) throw new Error('Gemini API 응답이 비어있습니다.');

      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ?? text.match(/(\{[\s\S]*\})/);
      if (!jsonMatch) throw new Error('응답에서 JSON을 찾을 수 없습니다.');
      const result = JSON.parse(jsonMatch[1] ?? jsonMatch[0]);

      memCache.set(cacheKey, result);
      saveToStorage(cacheKey, result);
      return result;
    } finally {
      inFlight.delete(cacheKey);
    }
  })();

  inFlight.set(cacheKey, promise);
  return promise;
}
