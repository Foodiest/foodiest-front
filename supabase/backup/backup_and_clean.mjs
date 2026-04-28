import { createClient } from '@supabase/supabase-js'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://adgskjyflkvydvngmtmr.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkZ3NranlmbGt2eWR2bmdtdG1yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzAwMzM1OCwiZXhwIjoyMDkyNTc5MzU4fQ.QiPpB-4MhhAnS72JrGlDwM7TyEXxGybAC4MbdPw-xkc'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// 삭제 순서 (FK 의존성 고려) - users는 제외
const TABLES_TO_CLEAN = [
  'notifications',
  'reports',
  'saved_restaurants',
  'reservations',
  'reviews',
  'restaurants',
]

async function fetchAll(table) {
  const rows = []
  const PAGE = 1000
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .range(from, from + PAGE - 1)
    if (error) throw new Error(`fetch ${table}: ${error.message}`)
    rows.push(...data)
    if (data.length < PAGE) break
    from += PAGE
  }
  return rows
}

async function backup() {
  console.log('=== 백업 시작 ===')
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const dir = join(__dirname, timestamp)
  mkdirSync(dir, { recursive: true })

  const allTables = ['users', ...TABLES_TO_CLEAN]
  for (const table of allTables) {
    process.stdout.write(`  백업 중: ${table} ... `)
    const rows = await fetchAll(table)
    writeFileSync(join(dir, `${table}.json`), JSON.stringify(rows, null, 2))
    console.log(`${rows.length}건`)
  }
  console.log(`백업 완료 → supabase/backup/${timestamp}/\n`)
}

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
  console.log('\n=== 완료 ===')
}

async function main() {
  await backup()
  await clean()
}

main().catch(e => { console.error('오류:', e.message); process.exit(1) })
