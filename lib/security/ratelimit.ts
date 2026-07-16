import { getSql } from '../analytics/db';

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the current window closes. 0 when `ok`. */
  retryAfterSec: number;
  /** Live key count in the in-memory store. Exposed for tests. */
  size: number;
}

interface Bucket {
  count: number;
  /** Epoch ms at which this window closes. */
  reset: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Ceiling on tracked keys. Every distinct IP mints a key, so an attacker
 * rotating source addresses would otherwise grow this Map without bound.
 * At the cap we drop the oldest-expiring keys — their owners get a fresh
 * window, which is the safe direction to fail for a portfolio.
 */
export const MEMORY_MAX_KEYS = 10_000;

/** Test-only: drop all state so cases don't leak into each other. */
export function __resetMemoryLimit(): void {
  buckets.clear();
}

/** Drop closed windows. Cheap, and on a quiet site it keeps the Map near-empty. */
function sweepExpired(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.reset <= now) buckets.delete(key);
  }
}

/** Enforce the ceiling once the current call's key is in, so size never exceeds it. */
function enforceCap(): void {
  if (buckets.size <= MEMORY_MAX_KEYS) return;
  const bySoonestReset = [...buckets].sort((a, b) => a[1].reset - b[1].reset);
  for (const [key] of bySoonestReset.slice(0, buckets.size - MEMORY_MAX_KEYS)) {
    buckets.delete(key);
  }
}

/**
 * Fixed-window limiter held in process memory.
 *
 * On serverless this counts per instance, not per deployment: an attacker whose
 * requests land on N cold instances gets N windows. That is fine for shedding
 * volume (analytics floods) and NOT fine as the only guard on a credential
 * check — see `dbLimit`, which login and contact use instead.
 */
export function memoryLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now()
): RateLimitResult {
  sweepExpired(now);

  const bucket = buckets.get(key);
  if (!bucket) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    enforceCap();
    return { ok: true, retryAfterSec: 0, size: buckets.size };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.reset - now) / 1000)),
      size: buckets.size
    };
  }
  return { ok: true, retryAfterSec: 0, size: buckets.size };
}

interface LimitRow {
  count: number;
  retry_after: number;
}

/**
 * Rows are keyed per IP, so the table would otherwise keep one forever for every
 * address that ever hit a limited route. Swept on a call counter rather than a timer
 * because serverless instances are frozen between requests, and deterministically
 * rather than at random so the behaviour is reproducible.
 */
const SWEEP_EVERY_CALLS = 500;
const SWEEP_OLDER_THAN_SEC = 24 * 60 * 60;
let callsSinceSweep = 0;

async function maybeSweep(sql: ReturnType<typeof getSql>): Promise<void> {
  if (++callsSinceSweep < SWEEP_EVERY_CALLS) return;
  callsSinceSweep = 0;
  try {
    await sql`
      DELETE FROM rate_limits
      WHERE window_start < now() - make_interval(secs => ${SWEEP_OLDER_THAN_SEC})
    `;
  } catch (err) {
    // A failed sweep is housekeeping debt, never a reason to fail the request.
    console.error('[ratelimit] sweep failed', err);
  }
}

/**
 * Fixed-window limiter counted in Postgres, so the window is shared across every
 * serverless instance. One atomic upsert per call — reserved for low-volume,
 * high-value routes (login, contact) where a per-instance count would be a hole.
 *
 * Falls back to `memoryLimit` when there is no database or the query fails:
 * a Neon outage should degrade the guard, not lock the owner out of the dashboard.
 */
export async function dbLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  if (!process.env.DATABASE_URL) return memoryLimit(key, limit, windowMs);

  const windowSec = Math.ceil(windowMs / 1000);
  try {
    const sql = getSql();
    const rows = (await sql`
      INSERT INTO rate_limits (key, count, window_start)
      VALUES (${key}, 1, now())
      ON CONFLICT (key) DO UPDATE SET
        count = CASE
          WHEN rate_limits.window_start < now() - make_interval(secs => ${windowSec})
          THEN 1 ELSE rate_limits.count + 1
        END,
        window_start = CASE
          WHEN rate_limits.window_start < now() - make_interval(secs => ${windowSec})
          THEN now() ELSE rate_limits.window_start
        END
      RETURNING
        count,
        ceil(extract(epoch FROM
          (window_start + make_interval(secs => ${windowSec})) - now()
        ))::int AS retry_after
    `) as LimitRow[];

    await maybeSweep(sql);

    const row = rows[0];
    if (!row) return memoryLimit(key, limit, windowMs);
    return row.count > limit
      ? { ok: false, retryAfterSec: Math.max(1, row.retry_after), size: buckets.size }
      : { ok: true, retryAfterSec: 0, size: buckets.size };
  } catch (err) {
    console.error('[ratelimit] db counter failed, falling back to memory', err);
    return memoryLimit(key, limit, windowMs);
  }
}

/**
 * Caller IP for rate-limit keys.
 *
 * `x-real-ip` is stamped by the Vercel edge from the real connection and cannot be
 * set by the client. `x-forwarded-for`'s leftmost token CAN be forged, so it is only
 * consulted for local/non-Vercel runs where `x-real-ip` is absent — accepting that a
 * self-hosted deploy behind an untrusted proxy can rotate this key at will.
 */
export function clientIp(headers: Headers): string {
  return (
    headers.get('x-real-ip')?.trim() ||
    (headers.get('x-forwarded-for') ?? '').split(',')[0]?.trim() ||
    'unknown'
  );
}
