import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'node:fs';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(url);
const ddl = readFileSync(new URL('../lib/analytics/schema.sql', import.meta.url), 'utf8');
const statements = ddl.split(';').map((s) => s.trim()).filter(Boolean);

for (const stmt of statements) {
  await sql.query(stmt);
}
console.log(`DB initialized (${statements.length} statements).`);
