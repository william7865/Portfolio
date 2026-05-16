import { describe, it, expect } from 'vitest';
import { shuttleEase, distance } from '@/lib/physics';

describe('physics', () => {
  it('shuttleEase(0) = 0', () => expect(shuttleEase(0)).toBe(0));
  it('shuttleEase(1) = 1', () => expect(shuttleEase(1)).toBe(1));
  it('shuttleEase mid is above linear', () => {
    expect(shuttleEase(0.5)).toBeGreaterThan(0.5);
  });
  it('distance is euclidean', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });
});
