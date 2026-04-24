-- =============================================
-- 04_storage.sql  —  Supabase Storage 버킷 설정
-- Supabase Dashboard → Storage 에서 실행하거나
-- SQL Editor에서 실행
-- =============================================

-- review-images 버킷 생성 (public)
insert into storage.buckets (id, name, public)
values ('review-images', 'review-images', true)
on conflict (id) do nothing;

-- 로그인 사용자만 업로드 가능
create policy "review-images: authenticated upload"
  on storage.objects for insert
  with check (bucket_id = 'review-images' and auth.role() = 'authenticated');

-- 전체 공개 읽기
create policy "review-images: public read"
  on storage.objects for select
  using (bucket_id = 'review-images');

-- 본인 파일만 삭제 가능
create policy "review-images: owner delete"
  on storage.objects for delete
  using (bucket_id = 'review-images' and auth.uid()::text = (storage.foldername(name))[1]);
