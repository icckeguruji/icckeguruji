import fs from 'node:fs';
import path from 'node:path';

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://gshjxcoyfrskxnpdqooy.supabase.co';

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

if (!SUPABASE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const TABLES = [
  'profiles',
  'courses',
  'subjects',
  'chapters',
  'recorded_lectures',
  'live_classes',
  'study_materials',
  'quizzes',
  'quiz_attempts',
  'payments',
  'notifications',
  'enrollments',
  'audit_logs',
];

async function fetchTable(table) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&limit=5000`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) {
    return { table, ok: false, status: res.status, rows: [] };
  }
  const rows = await res.json();
  return { table, ok: true, count: Array.isArray(rows) ? rows.length : 0, rows };
}

async function main() {
  const dateStr = new Date().toISOString().slice(0, 10);
  const outDir = path.resolve(process.cwd(), 'backups');
  fs.mkdirSync(outDir, { recursive: true });

  const results = {};
  for (const table of TABLES) {
    try {
      const data = await fetchTable(table);
      results[table] = data;
      console.log(`[backup] ${table}: ${data.ok ? `${data.count} rows` : `skipped (HTTP ${data.status})`}`);
    } catch (err) {
      results[table] = { table, ok: false, error: err?.message || String(err), rows: [] };
      console.warn(`[backup] ${table}: error`, err?.message || err);
    }
  }

  const outFile = path.join(outDir, `supabase-backup-${dateStr}.json`);
  fs.writeFileSync(
    outFile,
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        supabaseUrl: SUPABASE_URL,
        tables: results,
      },
      null,
      2
    )
  );
  console.log(`[backup] Saved to ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
