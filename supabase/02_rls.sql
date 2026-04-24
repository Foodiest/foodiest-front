-- =============================================
-- 02_rls.sql  —  Row Level Security 정책
-- 01_schema.sql 실행 후 실행
-- =============================================

alter table public.users              enable row level security;
alter table public.restaurants        enable row level security;
alter table public.reviews            enable row level security;
alter table public.saved_restaurants  enable row level security;

-- ── users ──────────────────────────────────
-- 전체 읽기 허용 (닉네임, 프로필 이미지 등 공개 정보)
create policy "users: public read"
  on public.users for select using (true);

-- 본인 프로필만 수정 가능
create policy "users: owner update"
  on public.users for update using (auth.uid() = id);

-- ── restaurants ────────────────────────────
-- 전체 읽기 허용
create policy "restaurants: public read"
  on public.restaurants for select using (true);

-- ── reviews ────────────────────────────────
-- 전체 읽기 허용
create policy "reviews: public read"
  on public.reviews for select using (true);

-- 로그인 사용자만 작성
create policy "reviews: authenticated insert"
  on public.reviews for insert with check (auth.uid() = user_id);

-- 본인 리뷰만 수정/삭제
create policy "reviews: owner update"
  on public.reviews for update using (auth.uid() = user_id);

create policy "reviews: owner delete"
  on public.reviews for delete using (auth.uid() = user_id);

-- ── saved_restaurants ──────────────────────
-- 본인 저장 목록만 조회
create policy "saved: owner read"
  on public.saved_restaurants for select using (auth.uid() = user_id);

-- 로그인 사용자만 저장
create policy "saved: authenticated insert"
  on public.saved_restaurants for insert with check (auth.uid() = user_id);

-- 본인 저장만 삭제
create policy "saved: owner delete"
  on public.saved_restaurants for delete using (auth.uid() = user_id);
