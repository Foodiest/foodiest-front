const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

const cache = new Map();

export async function analyzeReviews(restaurantName, reviews) {
  if (!GEMINI_API_KEY) throw new Error('VITE_GEMINI_API_KEY가 설정되지 않았습니다.');
  if (!reviews?.length) return null;

  const cacheKey = `${restaurantName}_${reviews.length}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const reviewTexts = reviews.slice(0, 20).map((r, i) =>
    `리뷰 ${i + 1} (별점: ${r.rating}/5): ${r.review_text}`
  ).join('\n');

  const prompt = `아래는 "${restaurantName}" 식당의 리뷰입니다.

${reviewTexts}

이 리뷰들을 분석해서 아래 JSON만 반환하세요. 설명 없이 JSON만:
{"summary":"2문장 한국어 요약","scores":{"taste":맛점수0-100,"service":서비스점수0-100,"atmosphere":분위기점수0-100}}`;

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 512,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error?.message || `Gemini API 오류: ${response.status}`);
  }

  const data = await response.json();
  console.log('[Gemini 응답]', JSON.stringify(data?.candidates?.[0]?.content, null, 2));

  // thinking 모델은 parts가 여러 개일 수 있으므로 전체 합산
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const text = parts.map(p => p.text ?? '').join('');
  if (!text) throw new Error('Gemini API 응답이 비어있습니다.');

  // JSON 블록 추출
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('응답에서 JSON을 찾을 수 없습니다.');

  const result = JSON.parse(match[0]);
  cache.set(cacheKey, result);
  return result;
}
