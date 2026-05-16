import { describe, it, expect, vi } from 'vitest';
import { createKonamiDetector } from '@/lib/konami';

const SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a'
];

describe('konami', () => {
  it('triggers callback when full sequence typed', () => {
    const cb = vi.fn();
    const d = createKonamiDetector(cb);
    for (const k of SEQUENCE) d.push(k);
    expect(cb).toHaveBeenCalledOnce();
  });

  it('resets on wrong key', () => {
    const cb = vi.fn();
    const d = createKonamiDetector(cb);
    d.push('ArrowUp');
    d.push('x');
    for (const k of SEQUENCE) d.push(k);
    expect(cb).toHaveBeenCalledOnce();
  });

  it('only triggers once unless reset()', () => {
    const cb = vi.fn();
    const d = createKonamiDetector(cb);
    for (const k of SEQUENCE) d.push(k);
    for (const k of SEQUENCE) d.push(k);
    expect(cb).toHaveBeenCalledOnce();
    d.reset();
    for (const k of SEQUENCE) d.push(k);
    expect(cb).toHaveBeenCalledTimes(2);
  });
});
