import { describe, it, expect } from 'vitest';
import { niceMax, xTicks } from './ticks';
import { fillBuckets } from './series';

const NOW = new Date('2026-06-11T12:34:56Z'); // Thursday

describe('niceMax', () => {
  it('rounds up to the next 1/2/5 x 10^n, bumping odd results to even', () => {
    expect(niceMax(7)).toBe(10);
    expect(niceMax(12)).toBe(20);
    expect(niceMax(47)).toBe(50);
    expect(niceMax(120)).toBe(200);
    expect(niceMax(1)).toBe(2); // odd (1) bumped to 2
    expect(niceMax(2)).toBe(2);
    expect(niceMax(5)).toBe(6); // odd (5) bumped to 6
  });

  it('never returns less than 2, so it is always a safe divisor with an integer half', () => {
    expect(niceMax(0)).toBe(2);
    expect(niceMax(-3)).toBe(2);
  });

  it('always returns an even integer at or above the input, so max/2 is a whole number', () => {
    const inputs = [0, -3, 0.4, 1, 2, 3, 5, 7, 12, 47, 99, 100, 120, 1000];
    for (const value of inputs) {
      const r = niceMax(value);
      expect(r).toBeGreaterThanOrEqual(1);
      expect(r).toBeGreaterThanOrEqual(value);
      expect(r % 2).toBe(0);
      expect(Number.isInteger(r / 2)).toBe(true);
    }
  });
});

describe('xTicks', () => {
  it('labels every six hours on the 24h range', () => {
    const points = fillBuckets([], { bucket: 'hour', count: 24, now: NOW });
    const ticks = xTicks(points, 'hour');
    expect(ticks.map((t) => t.label)).toEqual(['18h', '00h', '06h', '12h']);
  });

  it('names all seven weekdays on the 7d range', () => {
    const points = fillBuckets([], { bucket: 'day', count: 7, now: NOW });
    const ticks = xTicks(points, 'day');
    expect(ticks).toHaveLength(7);
    expect(ticks.map((t) => t.label)).toEqual(['ven', 'sam', 'dim', 'lun', 'mar', 'mer', 'jeu']);
    expect(ticks.map((t) => t.index)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('dates every seventh bar on the 30d range', () => {
    const points = fillBuckets([], { bucket: 'day', count: 30, now: NOW });
    const ticks = xTicks(points, 'day');
    expect(ticks.map((t) => t.index)).toEqual([0, 7, 14, 21, 28]);
    expect(ticks.at(0)?.label).toBe('13 mai');
    expect(ticks.at(-1)?.label).toBe('10 juin');
  });

  it('labels month changes on the 90d range', () => {
    const points = fillBuckets([], { bucket: 'week', count: 13, now: NOW });
    const ticks = xTicks(points, 'week');
    expect(ticks.map((t) => t.label)).toEqual(['mars', 'avr', 'mai', 'juin']);
    expect(ticks.at(0)?.index).toBe(0);
  });

  it('returns no ticks for an empty series', () => {
    expect(xTicks([], 'day')).toEqual([]);
  });
});
