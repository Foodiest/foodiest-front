import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://adgskjyflkvydvngmtmr.supabase.co';
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkZ3NranlmbGt2eWR2bmdtdG1yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzAwMzM1OCwiZXhwIjoyMDkyNTc5MzU4fQ.QiPpB-4MhhAnS72JrGlDwM7TyEXxGybAC4MbdPw-xkc';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function cleanText(text) {
  if (!text) return text;
  // 앞뒤 공백 포함해서 "더보기" 제거 (줄바꿈 경계도 처리)
  return text.replace(/\s*더보기\s*/g, ' ').trim();
}

async function main() {
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('id, review_text')
    .ilike('review_text', '%더보기%');

  if (error) {
    console.error('리뷰 조회 실패:', error.message);
    process.exit(1);
  }

  if (!reviews || reviews.length === 0) {
    console.log('"더보기"가 포함된 리뷰가 없습니다.');
    return;
  }

  console.log(`"더보기"가 포함된 리뷰 ${reviews.length}건 발견:\n`);

  for (const review of reviews) {
    const cleaned = cleanText(review.review_text);
    console.log(`[${review.id}]`);
    console.log(`  이전: ${review.review_text}`);
    console.log(`  이후: ${cleaned}`);

    const { error: updateError } = await supabase
      .from('reviews')
      .update({ review_text: cleaned })
      .eq('id', review.id);

    if (updateError) {
      console.error(`  업데이트 실패:`, updateError.message);
    } else {
      console.log(`  완료`);
    }
    console.log('');
  }

  console.log('클린업 완료');
}

main();
