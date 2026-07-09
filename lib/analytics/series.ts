import type { Bucket } from './range';

export interface Point {
  /** UTC bucket start, `YYYY-MM-DDTHH:MM:SSZ`. Matches the SQL `to_char` format. */
  key: string;
  views: number;
  uniques: number;
  /** True on the current, still-running bucket. Rendered hatched, never trusted as final. */
  partial?: boolean;
}

/** Serialize a bucket start. Second precision: buckets never carry milliseconds. */
export function bucketKey(d: Date): string {
  return `${d.toISOString().slice(0, 19)}Z`;
}

/** Truncate to the start of the containing bucket, in UTC. Weeks start Monday, like postgres. */
export function bucketStart(d: Date, bucket: Bucket): Date {
  const x = new Date(
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      bucket === 'hour' ? d.getUTCHours() : 0
    )
  );
  if (bucket === 'week') {
    const mondayOffset = (x.getUTCDay() + 6) % 7; // Sunday(0) -> 6, Monday(1) -> 0
    x.setUTCDate(x.getUTCDate() - mondayOffset);
  }
  return x;
}

/** Shift by `n` buckets (negative goes back in time). */
export function addBuckets(d: Date, bucket: Bucket, n: number): Date {
  const x = new Date(d);
  if (bucket === 'hour') x.setUTCHours(x.getUTCHours() + n);
  else if (bucket === 'day') x.setUTCDate(x.getUTCDate() + n);
  else x.setUTCDate(x.getUTCDate() + n * 7);
  return x;
}

/**
 * Expand sparse SQL rows into exactly `count` points, ascending, zero-filled.
 * The window is bucket-aligned: the oldest bucket is whole, the newest is in progress.
 */
export function fillBuckets(
  rows: Point[],
  opts: { bucket: Bucket; count: number; now: Date }
): Point[] {
  const { bucket, count, now } = opts;
  const byKey = new Map(rows.map((r) => [r.key, r]));
  const anchor = bucketStart(now, bucket);
  const out: Point[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const key = bucketKey(addBuckets(anchor, bucket, -i));
    const row = byKey.get(key) ?? { key, views: 0, uniques: 0 };
    out.push(i === 0 ? { ...row, partial: true } : row);
  }
  return out;
}

/** Relative change in percent. null = no baseline (prev 0, cur > 0). */
export function pctDelta(cur: number, prev: number): number | null {
  if (prev === 0) return cur === 0 ? 0 : null;
  return ((cur - prev) / prev) * 100;
}

/**
 * Difference between two percentages, in percentage points.
 * 40% -> 50% is +10 pts, not +25%. Use this for any value already expressed as a percent.
 */
export function pointDelta(cur: number, prev: number): number {
  return cur - prev;
}
