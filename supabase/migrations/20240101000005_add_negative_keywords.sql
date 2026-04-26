-- reviews 테이블에 negative_keywords 컬럼 추가
alter table public.reviews
  add column if not exists negative_keywords text[] default '{}';
