import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from '@/lib/storage';

describe('storage', () => {
  beforeEach(() => localStorage.clear());

  it('returns default when key missing', () => {
    expect(storage.get('mp.score', 0)).toBe(0);
  });

  it('persists and reads number', () => {
    storage.set('mp.score', 14);
    expect(storage.get('mp.score', 0)).toBe(14);
  });

  it('persists and reads complex object', () => {
    storage.set('mp.achievements', { firstBlood: true });
    expect(storage.get('mp.achievements', {})).toEqual({ firstBlood: true });
  });

  it('returns default on JSON corruption', () => {
    localStorage.setItem('mp.score', '{invalid');
    expect(storage.get('mp.score', 7)).toBe(7);
  });
});
