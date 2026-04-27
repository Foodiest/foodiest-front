create table if not exists public.reservations (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  restaurant_id integer not null references public.restaurants(id) on delete cascade,
  date          date not null,
  time          text not null,
  party_size    integer not null check (party_size >= 1 and party_size <= 20),
  status        text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at    timestamptz default now()
);

alter table public.reservations enable row level security;

create policy "reservations: owner read"
  on public.reservations for select using (auth.uid() = user_id);

create policy "reservations: authenticated insert"
  on public.reservations for insert with check (auth.uid() = user_id);

create policy "reservations: owner update"
  on public.reservations for update using (auth.uid() = user_id);

create policy "reservations: owner delete"
  on public.reservations for delete using (auth.uid() = user_id);
