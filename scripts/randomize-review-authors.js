import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://adgskjyflkvydvngmtmr.supabase.co';
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkZ3NranlmbGt2eWR2bmdtdG1yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzAwMzM1OCwiZXhwIjoyMDkyNTc5MzU4fQ.QiPpB-4MhhAnS72JrGlDwM7TyEXxGybAC4MbdPw-xkc';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function main() {
  // 1. users 테이블에서 모든 id(bigint PK) 조회
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id');

  if (usersError) {
    console.error('유저 조회 실패:', usersError.message);
    process.exit(1);
  }

  if (!users || users.length === 0) {
    console.error('users 테이블에 유저가 없습니다.');
    process.exit(1);
  }

  const userIds = users.map((u) => u.id);
  console.log(`유저 ${userIds.length}명 조회 완료`);

  // 2. reviews 테이블에서 모든 리뷰 id 조회
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('id');

  if (reviewsError) {
    console.error('리뷰 조회 실패:', reviewsError.message);
    process.exit(1);
  }

  if (!reviews || reviews.length === 0) {
    console.log('리뷰가 없습니다.');
    process.exit(0);
  }

  console.log(`리뷰 ${reviews.length}건 조회 완료 — 작성자 랜덤 배정 시작`);

  // 3. 각 리뷰에 랜덤 user_id 업데이트
  let successCount = 0;
  let failCount = 0;

  for (const review of reviews) {
    const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];

    const { error } = await supabase
      .from('reviews')
      .update({ user_id: randomUserId })
      .eq('id', review.id);

    if (error) {
      console.error(`리뷰 ${review.id} 업데이트 실패:`, error.message);
      failCount++;
    } else {
      successCount++;
    }
  }

  console.log(`\n완료 — 성공: ${successCount}건 / 실패: ${failCount}건`);
}

main();
