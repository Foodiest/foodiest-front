const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY?.trim().replace(/[^\x20-\x7E]/g, '');
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
모든 텍스트는 반드시 한국어로만 작성하세요. 영어, 일본어, 중국어 등 다른 언어는 절대 사용하지 마세요.
반드시 JSON 형식만 반환해야 하며, 다른 설명은 포함하지 마세요.`;

  const userPrompt = `아래는 "${restaurantName}" 식당의 리뷰입니다. 분석 결과를 JSON으로 반환하세요.

리뷰 데이터:
${reviewTexts}

응답 형식:
{"summary":"2문장 한국어 요약","scores":{"taste":점수,"service":점수,"atmosphere":점수},"keywords":{"positive":["긍정키워드1","긍정키워드2",...],"negative":["부정키워드1","부정키워드2",...]}}

keywords 추출 규칙:
- 리뷰에서 실제로 언급된 내용을 기반으로 추출하세요.
- 자연스럽고 구어적인 한국어 표현을 사용하세요. (예: "맛있어요" → "맛집", "줄이 길어요" → "웨이팅 있음", "친절했어요" → "친절한 직원")
- 형용사보다는 명사형 또는 짧은 서술형 표현을 선호하세요. (예: "고소한" → "고소한 맛", "시끄러운" → "소음 있음")
- positive는 최대 8개, negative는 최대 5개.
- 각 키워드는 10자 이내의 간결한 표현으로 작성하세요.`;

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
        max_tokens: 1024,
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
