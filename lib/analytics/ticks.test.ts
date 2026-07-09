import { describe, it, expect } from 'vitest';
import { niceMax, xTicks } from './ticks';
import { fillBuckets } from './series';

const NOW = new Date('2026-06-11T12:34:56Z'); // Thursday

describe('niceMax', () => {
  it('rounds up to the next 1/2/5 x 10^n', () => {
    expect(niceMax(7)).toBe(10);
    expect(niceMax(12)).toBe(20);
    expect(niceMax(47)).toBe(50);
    expect(niceMax(120)).toBe(200);
    expect(niceMax(1)).toBe(1);
    expect(niceMax(2)).toBe(2);
    expect(niceMax(5)).toBe(5);
  });

  it('never returns zero, so it is always a safe divisor', () => {
    expect(niceMax(0)).toBe(1);
    expect(niceMax(-3)).toBe(1);
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
