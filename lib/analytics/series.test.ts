import { describe, it, expect } from 'vitest';
import { fillDays, pctDelta, type DayPoint } from './series';

const TODAY = new Date('2026-06-08T12:00:00Z');

describe('fillDays', () => {
  it('returns exactly rangeDays points in ascending order', () => {
    const out = fillDays([], 7, TODAY);
    expect(out).toHaveLength(7);
    expect(out[0].day).toBe('2026-06-02');
    expect(out[6].day).toBe('2026-06-08');
  });

  it('fills missing days with zeros and keeps existing rows', () => {
    const rows: DayPoint[] = [{ day: '2026-06-08', views: 5, uniques: 3 }];
    const out = fillDays(rows, 3, TODAY);
    expect(out).toEqual([
      { day: '2026-06-06', views: 0, uniques: 0 },
      { day: '2026-06-07', views: 0, uniques: 0 },
      { day: '2026-06-08', views: 5, uniques: 3 }
    ]);
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
