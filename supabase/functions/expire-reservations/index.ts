import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // date + time을 합쳐 현재 시각과 비교 (한국 시간 기준)
  const { data, error } = await supabase
    .from('reservations')
    .update({ status: 'completed' })
    .in('status', ['pending', 'confirmed'])
    .lt('date', new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }))
    .select('id');

  // 날짜가 오늘인데 시간이 지난 경우도 처리
  const todayKST = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
  const nowTimeKST = new Date().toLocaleTimeString('en-GB', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
  });

  const { data: todayData, error: todayError } = await supabase
    .from('reservations')
    .update({ status: 'completed' })
    .in('status', ['pending', 'confirmed'])
    .eq('date', todayKST)
    .lt('time', nowTimeKST)
    .select('id');

  if (error || todayError) {
    return new Response(
      JSON.stringify({ error: error?.message || todayError?.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const updated = (data?.length ?? 0) + (todayData?.length ?? 0);
  return new Response(
    JSON.stringify({ updated }),
    { headers: { 'Content-Type': 'application/json' } },
  );
});
