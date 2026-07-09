export type RangeKey = '24h' | '7d' | '30d' | '90d';
export type Bucket = 'hour' | 'day' | 'week';

export interface RangeSpec {
  /** Granularity of one bar in the frequency chart. */
  bucket: Bucket;
  /** Number of buckets displayed, including the in-progress one. */
  count: number;
}

export const RANGE_KEYS = ['24h', '7d', '30d', '90d'] as const satisfies readonly RangeKey[];

/** 13 weeks = 91 days, the smallest whole-week window covering 90 days. */
export const RANGES: Record<RangeKey, RangeSpec> = {
  '24h': { bucket: 'hour', count: 24 },
  '7d': { bucket: 'day', count: 7 },
  '30d': { bucket: 'day', count: 30 },
  '90d': { bucket: 'week', count: 13 }
};

/** `?range=30` was the pre-bucket param format; keep old links alive. */
const LEGACY: Record<string, RangeKey> = { '7': '7d', '30': '30d', '90': '90d' };

export function normalizeRange(value: string | undefined): RangeKey {
  if (!value) return '30d';
  if (value in RANGES) return value as RangeKey;
  return LEGACY[value] ?? '30d';
}
