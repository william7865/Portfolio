import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'node:fs';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(url);
const ddl = readFileSync(new URL('../lib/analytics/schema.sql', import.meta.url), 'utf8');

// Strip `--` comments BEFORE splitting on ';'. Splitting the raw file means any
// semicolon inside a comment cuts a statement in half and feeds the remainder to
// Postgres as bare SQL — the prose after it becomes a syntax error at a spot that
// points nowhere near the actual comment.
const statements = ddl
  .split('\n')
  .map((line) => line.replace(/--.*$/, ''))
  .join('\n')
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean);

for (const stmt of statements) {
  await sql.query(stmt);
}
console.log(`DB initialized (${statements.length} statements).`);
