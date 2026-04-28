import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://adgskjyflkvydvngmtmr.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkZ3NranlmbGt2eWR2bmdtdG1yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzAwMzM1OCwiZXhwIjoyMDkyNTc5MzU4fQ.QiPpB-4MhhAnS72JrGlDwM7TyEXxGybAC4MbdPw-xkc'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const TABLES_TO_CLEAN = [
  'notifications',
  'reports',
  'saved_restaurants',
  'reservations',
  'reviews',
  'restaurants',
]

async function clean() {
  console.log('=== 데이터 삭제 시작 (users 제외) ===')
  for (const table of TABLES_TO_CLEAN) {
    process.stdout.write(`  삭제 중: ${table} ... `)
    const { error, count } = await supabase
      .from(table)
      .delete({ count: 'exact' })
      .not('id', 'is', null)
    if (error) throw new Error(`delete ${table}: ${error.message}`)
    console.log(`완료 (${count ?? '?'}건 삭제)`)
  }
  console.log('\n=== 모든 데이터 삭제 완료 (users 유지) ===')
}

clean().catch(e => { console.error('오류:', e.message); process.exit(1) })
