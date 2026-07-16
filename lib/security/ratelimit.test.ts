import { describe, it, expect } from 'vitest';
import { memoryLimit, __resetMemoryLimit, MEMORY_MAX_KEYS } from './ratelimit';

const WINDOW = 60_000;
const NOW = 1_700_000_000_000;

describe('memoryLimit', () => {
  it('allows up to `limit` hits inside the window', () => {
    __resetMemoryLimit();
    for (let i = 0; i < 3; i++) {
      expect(memoryLimit('a', 3, WINDOW, NOW).ok).toBe(true);
    }
  });

  it('blocks the hit past `limit`', () => {
    __resetMemoryLimit();
    for (let i = 0; i < 3; i++) memoryLimit('a', 3, WINDOW, NOW);
    const res = memoryLimit('a', 3, WINDOW, NOW);
    expect(res.ok).toBe(false);
    expect(res.retryAfterSec).toBeGreaterThan(0);
  });

  it('keys are independent', () => {
    __resetMemoryLimit();
    for (let i = 0; i < 3; i++) memoryLimit('a', 3, WINDOW, NOW);
    expect(memoryLimit('b', 3, WINDOW, NOW).ok).toBe(true);
  });

  it('starts a fresh window once the old one elapses', () => {
    __resetMemoryLimit();
    for (let i = 0; i < 3; i++) memoryLimit('a', 3, WINDOW, NOW);
    expect(memoryLimit('a', 3, WINDOW, NOW).ok).toBe(false);
    expect(memoryLimit('a', 3, WINDOW, NOW + WINDOW + 1).ok).toBe(true);
  });

  it('reports a retryAfter that shrinks as the window drains', () => {
    __resetMemoryLimit();
    memoryLimit('a', 1, WINDOW, NOW);
    const early = memoryLimit('a', 1, WINDOW, NOW + 1_000).retryAfterSec;
    const late = memoryLimit('a', 1, WINDOW, NOW + 50_000).retryAfterSec;
    expect(late).toBeLessThan(early);
    expect(late).toBeGreaterThanOrEqual(1);
  });

  // Without eviction, one request per forged key is an unbounded Map insert:
  // the limiter itself becomes the memory-exhaustion vector it exists to stop.
  it('evicts expired keys instead of growing without bound', () => {
    __resetMemoryLimit();
    for (let i = 0; i < 100; i++) memoryLimit(`k${i}`, 5, WINDOW, NOW);
    expect(memoryLimit('probe', 5, WINDOW, NOW + WINDOW + 1).size).toBe(1);
  });

  it('caps live keys even when none have expired', () => {
    __resetMemoryLimit();
    for (let i = 0; i < MEMORY_MAX_KEYS + 500; i++) {
      memoryLimit(`k${i}`, 5, WINDOW, NOW);
    }
    expect(memoryLimit('probe', 5, WINDOW, NOW).size).toBeLessThanOrEqual(MEMORY_MAX_KEYS);
  });
});
