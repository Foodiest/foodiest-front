import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://adgskjyflkvydvngmtmr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkZ3NranlmbGt2eWR2bmdtdG1yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzAwMzM1OCwiZXhwIjoyMDkyNTc5MzU4fQ.QiPpB-4MhhAnS72JrGlDwM7TyEXxGybAC4MbdPw-xkc'
);

const fixes = [
  // 팔복오리 - 분당 정확한 좌표
  { id: 17, x: 127.10974249056558, y: 37.33765653340663, address: '경기 성남시 분당구 구미로 8' },
  // 손정보쌈 - 카카오 미등록, 오리역 근처 좌표
  { id: 3,  x: 127.109390220144,   y: 37.3395,           address: '경기 성남시 분당구 오리역 인근' },
];

for (const { id, x, y, address } of fixes) {
  const { error } = await supabase.from('restaurants').update({ x, y, address }).eq('id', id);
  if (error) console.log(`✗ [${id}] ${error.message}`);
  else       console.log(`✓ [${id}] (${x}, ${y}) ${address}`);
}
