import { describe, it, expect } from 'vitest';
import { offsets } from './queries';
import { RANGES, RANGE_KEYS } from './range';

describe('offsets', () => {
  it('shifts back by count - 1 buckets, so the window holds exactly `count` of them', () => {
    expect(offsets({ bucket: 'hour', count: 24 })).toEqual({ hours: 23, days: 0, weeks: 0 });
    expect(offsets({ bucket: 'day', count: 30 })).toEqual({ hours: 0, days: 29, weeks: 0 });
    expect(offsets({ bucket: 'week', count: 13 })).toEqual({ hours: 0, days: 0, weeks: 12 });
  });

  it('puts the offset on exactly one unit, whatever the range', () => {
    for (const key of RANGE_KEYS) {
      const o = offsets(RANGES[key]);
      const nonZero = [o.hours, o.days, o.weeks].filter((n) => n !== 0);
      expect(nonZero).toHaveLength(1);
    }
  });

  it('collapses to a zero offset on a single-bucket window', () => {
    expect(offsets({ bucket: 'day', count: 1 })).toEqual({ hours: 0, days: 0, weeks: 0 });
  });
});
