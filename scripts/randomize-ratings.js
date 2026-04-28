import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://adgskjyflkvydvngmtmr.supabase.co';
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkZ3NranlmbGt2eWR2bmdtdG1yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzAwMzM1OCwiZXhwIjoyMDkyNTc5MzU4fQ.QiPpB-4MhhAnS72JrGlDwM7TyEXxGybAC4MbdPw-xkc';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function randomRating() {
  // 2, 3, 4 중 랜덤
  return Math.floor(Math.random() * 3) + 2;
}

async function main() {
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('id, rating');

  if (error) {
    console.error('리뷰 조회 실패:', error.message);
    process.exit(1);
  }

  console.log(`총 ${reviews.length}건 처리 시작...\n`);

  let success = 0;
  for (const review of reviews) {
    const newRating = randomRating();
    const { error: updateError } = await supabase
      .from('reviews')
      .update({ rating: newRating })
      .eq('id', review.id);

    if (updateError) {
      console.error(`[${review.id}] 실패:`, updateError.message);
    } else {
      console.log(`[${review.id}] ${review.rating}점 → ${newRating}점`);
      success++;
    }
  }

  console.log(`\n완료: ${success}/${reviews.length}건 업데이트`);
}

main();
