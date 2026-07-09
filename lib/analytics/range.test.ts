import { describe, it, expect } from 'vitest';
import { normalizeRange, RANGES, RANGE_KEYS } from './range';

describe('RANGES', () => {
  it('never exceeds 30 buckets, so the x-axis stays legible', () => {
    for (const key of RANGE_KEYS) {
      expect(RANGES[key].count).toBeLessThanOrEqual(30);
    }
  });

  it('maps each period to its bucket granularity', () => {
    expect(RANGES['24h']).toEqual({ bucket: 'hour', count: 24 });
    expect(RANGES['7d']).toEqual({ bucket: 'day', count: 7 });
    expect(RANGES['30d']).toEqual({ bucket: 'day', count: 30 });
    expect(RANGES['90d']).toEqual({ bucket: 'week', count: 13 });
  });
});

describe('normalizeRange', () => {
  it('accepts the four range keys', () => {
    expect(normalizeRange('24h')).toBe('24h');
    expect(normalizeRange('7d')).toBe('7d');
    expect(normalizeRange('30d')).toBe('30d');
    expect(normalizeRange('90d')).toBe('90d');
  });

  it('accepts the legacy numeric params so old links keep working', () => {
    expect(normalizeRange('7')).toBe('7d');
    expect(normalizeRange('30')).toBe('30d');
    expect(normalizeRange('90')).toBe('90d');
  });

  it('falls back to 30d on anything else', () => {
    expect(normalizeRange(undefined)).toBe('30d');
    expect(normalizeRange('')).toBe('30d');
    expect(normalizeRange('nope')).toBe('30d');
    expect(normalizeRange('365')).toBe('30d');
  });

  it('rejects prototype-chain keys and falls back to 30d', () => {
    expect(normalizeRange('constructor')).toBe('30d');
    expect(normalizeRange('toString')).toBe('30d');
    expect(normalizeRange('valueOf')).toBe('30d');
    expect(normalizeRange('hasOwnProperty')).toBe('30d');
    expect(normalizeRange('__proto__')).toBe('30d');
  });
});
