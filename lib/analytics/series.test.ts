import { describe, it, expect } from 'vitest';
import { bucketStart, addBuckets, bucketKey, fillBuckets, pctDelta, pointDelta, type Point } from './series';

// A Thursday, 12:34 UTC.
const NOW = new Date('2026-06-11T12:34:56Z');

describe('bucketStart', () => {
  it('truncates to the hour', () => {
    expect(bucketKey(bucketStart(NOW, 'hour'))).toBe('2026-06-11T12:00:00Z');
  });

  it('truncates to UTC midnight', () => {
    expect(bucketKey(bucketStart(NOW, 'day'))).toBe('2026-06-11T00:00:00Z');
  });

  it('truncates to the preceding Monday, matching postgres date_trunc(week)', () => {
    expect(bucketKey(bucketStart(NOW, 'week'))).toBe('2026-06-08T00:00:00Z');
  });

  it('leaves a Monday on its own week', () => {
    const monday = new Date('2026-06-08T23:59:59Z');
    expect(bucketKey(bucketStart(monday, 'week'))).toBe('2026-06-08T00:00:00Z');
  });

  it('leaves a Sunday on the week that started six days earlier', () => {
    const sunday = new Date('2026-06-14T00:00:01Z');
    expect(bucketKey(bucketStart(sunday, 'week'))).toBe('2026-06-08T00:00:00Z');
  });
});

describe('addBuckets', () => {
  it('steps by hours', () => {
    expect(bucketKey(addBuckets(new Date('2026-06-11T12:00:00Z'), 'hour', -3))).toBe('2026-06-11T09:00:00Z');
  });

  it('steps by days across a month boundary', () => {
    expect(bucketKey(addBuckets(new Date('2026-06-02T00:00:00Z'), 'day', -3))).toBe('2026-05-30T00:00:00Z');
  });

  it('steps by whole weeks', () => {
    expect(bucketKey(addBuckets(new Date('2026-06-08T00:00:00Z'), 'week', -2))).toBe('2026-05-25T00:00:00Z');
  });
});

describe('fillBuckets', () => {
  it('returns exactly `count` points, oldest first', () => {
    const out = fillBuckets([], { bucket: 'day', count: 7, now: NOW });
    expect(out).toHaveLength(7);
    expect(out.at(0)?.key).toBe('2026-06-05T00:00:00Z');
    expect(out.at(-1)?.key).toBe('2026-06-11T00:00:00Z');
  });

  it('zero-fills gaps and keeps matching rows', () => {
    const rows: Point[] = [{ key: '2026-06-11T00:00:00Z', views: 5, uniques: 3 }];
    const out = fillBuckets(rows, { bucket: 'day', count: 3, now: NOW });
    expect(out).toEqual([
      { key: '2026-06-09T00:00:00Z', views: 0, uniques: 0 },
      { key: '2026-06-10T00:00:00Z', views: 0, uniques: 0 },
      { key: '2026-06-11T00:00:00Z', views: 5, uniques: 3, partial: true }
    ]);
  });

  it('marks only the last bucket as in-progress', () => {
    const out = fillBuckets([], { bucket: 'day', count: 4, now: NOW });
    expect(out.slice(0, 3).every((p) => p.partial === undefined)).toBe(true);
    expect(out.at(-1)?.partial).toBe(true);
  });

  it('buckets by hour', () => {
    const out = fillBuckets([], { bucket: 'hour', count: 24, now: NOW });
    expect(out).toHaveLength(24);
    expect(out.at(0)?.key).toBe('2026-06-10T13:00:00Z');
    expect(out.at(-1)?.key).toBe('2026-06-11T12:00:00Z');
  });

  it('buckets by week, anchored on Mondays', () => {
    const out = fillBuckets([], { bucket: 'week', count: 13, now: NOW });
    expect(out).toHaveLength(13);
    expect(out.at(0)?.key).toBe('2026-03-16T00:00:00Z');
    expect(out.at(-1)?.key).toBe('2026-06-08T00:00:00Z');
  });
});

describe('pctDelta', () => {
  it('computes a relative percentage change', () => {
    expect(pctDelta(120, 100)).toBeCloseTo(20);
    expect(pctDelta(80, 100)).toBeCloseTo(-20);
  });

  it('returns 0 when both are zero', () => {
    expect(pctDelta(0, 0)).toBe(0);
  });

  it('returns null when previous is zero but current is not (no baseline)', () => {
    expect(pctDelta(10, 0)).toBeNull();
  });
});

describe('pointDelta', () => {
  it('subtracts two percentages into percentage points', () => {
    expect(pointDelta(50, 40)).toBe(10);
    expect(pointDelta(40, 50)).toBe(-10);
    expect(pointDelta(0, 0)).toBe(0);
  });
});
