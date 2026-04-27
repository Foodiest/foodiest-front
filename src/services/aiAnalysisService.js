const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const cache = new Map();

export async function analyzeReviews(restaurantName, reviews) {
  if (!GROQ_API_KEY || GROQ_API_KEY === 'YOUR_GROQ_API_KEY_HERE') {
    throw new Error('VITE_GROQ_API_KEY가 설정되지 않았습니다. .env 파일을 확인해 주세요.');
  }
  if (!reviews?.length) return null;

  const cacheKey = `${restaurantName}_${reviews.length}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const reviewTexts = reviews.slice(0, 20).map((r, i) =>
    `리뷰 ${i + 1} (별점: ${r.rating}/5): ${r.review_text}`
  ).join('\n');

  const systemPrompt = `당신은 식당 리뷰 분석 전문가입니다. 
제공된 리뷰들을 기반으로 식당의 특징을 요약하고, 맛, 서비스, 분위기 점수를 0-100 사이로 산출하세요.
반드시 JSON 형식만 반환해야 하며, 다른 설명은 포함하지 마세요.`;

  const userPrompt = `아래는 "${restaurantName}" 식당의 리뷰입니다. 분석 결과를 JSON으로 반환하세요.
  
리뷰 데이터:
${reviewTexts}

응답 형식:
{"summary":"2문장 한국어 요약","scores":{"taste":점수,"service":점수,"atmosphere":점수}}`;

  try {
    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 512,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.error?.message || `Groq API 오류: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) throw new Error('Groq API 응답이 비어있습니다.');

    const result = JSON.parse(content);
    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('[Groq 분석 오류]', error);
    throw error;
  }
}
