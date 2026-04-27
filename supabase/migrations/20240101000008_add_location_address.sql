-- restaurants 테이블에 주소 컬럼 추가 및 좌표 컬럼 타입 변경 (text)
-- x, y: Kakao Maps에서 문자열로 반환되므로 text 타입으로 통일

alter table public.restaurants
  add column if not exists address text;

-- numeric → text 변환 (기존 데이터 유지)
alter table public.restaurants
  alter column x type text using (x::text);

alter table public.restaurants
  alter column y type text using (y::text);
