-- completed 상태 추가
alter table public.reservations
  drop constraint if exists reservations_status_check;

alter table public.reservations
  add constraint reservations_status_check
  check (status in ('pending', 'confirmed', 'cancelled', 'completed'));

-- Edge Function(service role)이 모든 예약을 업데이트할 수 있도록 정책 추가
create policy "reservations: service role update"
  on public.reservations for update
  to service_role
  using (true);
