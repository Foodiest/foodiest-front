import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://adgskjyflkvydvngmtmr.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkZ3NranlmbGt2eWR2bmdtdG1yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzAwMzM1OCwiZXhwIjoyMDkyNTc5MzU4fQ.QiPpB-4MhhAnS72JrGlDwM7TyEXxGybAC4MbdPw-xkc';
const KAKAO_JS_KEY = '53a6b328c11c7b544cee31b9792fefe6';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function searchKakao(name) {
  const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(name)}&size=1`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `KakaoAK ${KAKAO_JS_KEY}`,
      'Origin': 'http://localhost:5173',
      'Referer': 'http://localhost:5173',
      'KA': 'sdk/2.0 os/javascript origin/http://localhost:5173',
    },
  });
  const json = await res.json();
  return json.documents?.[0] ?? null;
}

const { data: restaurants, error } = await supabase
  .from('restaurants')
  .select('id, name, x, y')
  .order('id');

if (error) { console.error(error); process.exit(1); }

for (const r of restaurants) {
  if (r.x && r.y) {
    console.log(`✓ SKIP  [${r.id}] ${r.name} (좌표 있음)`);
    continue;
  }

  const result = await searchKakao(r.name);
  if (!result) {
    console.log(`✗ FAIL  [${r.id}] ${r.name} (검색 결과 없음)`);
    continue;
  }

  const { x, y, address_name, road_address_name } = result;
  const address = road_address_name || address_name || null;

  const { error: updateError } = await supabase
    .from('restaurants')
    .update({ x: Number(x), y: Number(y), address })
    .eq('id', r.id);

  if (updateError) {
    console.log(`✗ ERROR [${r.id}] ${r.name}: ${updateError.message}`);
  } else {
    console.log(`✓ OK    [${r.id}] ${r.name} → (${x}, ${y}) ${address}`);
  }

  await new Promise(res => setTimeout(res, 300));
}

console.log('\n완료!');
