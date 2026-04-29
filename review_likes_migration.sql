-- 1. reviews 테이블에 likes_count 컬럼 추가
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS likes_count INTEGER NOT NULL DEFAULT 0;

-- 2. review_likes 테이블 생성 (중복 추천 방지)
CREATE TABLE IF NOT EXISTS public.review_likes (
  id           BIGSERIAL PRIMARY KEY,
  review_id    TEXT        NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_auth_id UUID        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (review_id, user_auth_id)
);

-- 3. RLS 설정
ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "누구나 추천 조회 가능" ON public.review_likes
  FOR SELECT USING (true);

CREATE POLICY "로그인 유저 추천 가능" ON public.review_likes
  FOR INSERT WITH CHECK (auth.uid() = user_auth_id);

CREATE POLICY "본인 추천 취소 가능" ON public.review_likes
  FOR DELETE USING (auth.uid() = user_auth_id);

-- 4. 원자적 증가/감소 RPC 함수
CREATE OR REPLACE FUNCTION increment_review_likes(rid TEXT)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.reviews SET likes_count = likes_count + 1 WHERE id = rid;
$$;

CREATE OR REPLACE FUNCTION decrement_review_likes(rid TEXT)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.reviews SET likes_count = GREATEST(0, likes_count - 1) WHERE id = rid;
$$;

-- 5. 기존 리뷰에 유저 수 기준 랜덤 추천수 부여
--    (최소 0, 최대 35 / 최신 리뷰일수록 약간 높게)
UPDATE public.reviews
SET likes_count = (
  FLOOR(RANDOM() * 28)::INTEGER
  + CASE
      WHEN created_at > now() - INTERVAL '7 days'  THEN FLOOR(RANDOM() * 8)::INTEGER
      WHEN created_at > now() - INTERVAL '30 days' THEN FLOOR(RANDOM() * 5)::INTEGER
      ELSE 0
    END
);
