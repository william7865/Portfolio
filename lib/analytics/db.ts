import { neon } from '@neondatabase/serverless';

let _sql: ReturnType<typeof neon> | null = null;

/** Lazily-created Neon SQL tag. Throws if DATABASE_URL is missing. */
export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  if (!_sql) _sql = neon(url);
  return _sql;
}
