-- =============================================
-- 01_schema.sql
-- Supabase에서 SQL Editor에 붙여넣기 후 실행
-- =============================================

-- extensions
create extension if not exists "uuid-ossp";

-- =============================================
-- users (Supabase Auth와 별도로 프로필 저장)
-- =============================================
create table if not exists public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  user_id       text unique not null,
  nickname      text not null,
  email         text unique not null,
  password      text,                           -- bcrypt hash (auth.users.encrypted_password 복사)
  phone         text,
  profile_image text,
  provider      text not null default 'email', -- 'email' | 'google' | 'kakao'
  social_id     text,
  vibes         text[] default '{}',
  flavors       text[] default '{}',
  dietary       text[] default '{}',
  allergies     text[] default '{}',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- =============================================
-- restaurants
-- =============================================
create table if not exists public.restaurants (
  id          serial primary key,
  name        text not null,
  cuisine     text,
  price       text,
  rating      numeric(3,1) default 0,
  distance    text,
  badge       text,
  event       text,
  tags        text[] default '{}',
  note        text,
  quote       text,
  image       text,
  vibes       text[] default '{}',
  flavors     text[] default '{}',
  dietary     text[] default '{}',
  x           numeric(10,7),  -- longitude
  y           numeric(10,7),  -- latitude
  description text,
  hours       jsonb,          -- { weekday: string, weekend: string }
  phone       text,
  website     text,
  created_at  timestamptz default now()
);

-- =============================================
-- reviews
-- =============================================
create table if not exists public.reviews (
  id            text primary key,
  user_id       uuid not null references public.users(id) on delete cascade,
  restaurant_id int  not null references public.restaurants(id) on delete cascade,
  review_text   text not null,
  rating        smallint not null check (rating between 1 and 5),
  images        text[] default '{}',
  keywords      jsonb default '{}', -- { Vibe: [], Taste: [], Service: [] }
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- =============================================
-- saved_restaurants
-- =============================================
create table if not exists public.saved_restaurants (
  id            serial primary key,
  user_id       uuid not null references public.users(id) on delete cascade,
  restaurant_id int  not null references public.restaurants(id) on delete cascade,
  saved_at      timestamptz default now(),
  unique (user_id, restaurant_id)
);

-- =============================================
-- updated_at 자동 갱신 트리거
-- =============================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_users_updated
  before update on public.users
  for each row execute function public.handle_updated_at();

create trigger on_reviews_updated
  before update on public.reviews
  for each row execute function public.handle_updated_at();

-- =============================================
-- 신규 Auth 유저 등록 시 users 행 자동 생성
-- =============================================
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, user_id, nickname, email, provider, password)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'user_id', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'provider', 'email'),
    new.encrypted_password
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
