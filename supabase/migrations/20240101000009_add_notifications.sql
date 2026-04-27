create table if not exists public.notifications (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  type          text not null default 'follow',
  from_user_id  uuid references auth.users(id) on delete cascade,
  is_read       boolean not null default false,
  created_at    timestamptz default now()
);

alter table public.notifications enable row level security;

create policy "notifications: owner read"
  on public.notifications for select using (auth.uid() = user_id);

create policy "notifications: authenticated insert"
  on public.notifications for insert with check (auth.uid() is not null);

create policy "notifications: owner update"
  on public.notifications for update using (auth.uid() = user_id);

alter publication supabase_realtime add table public.notifications;
