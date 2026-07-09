import { describe, it, expect } from 'vitest';
import { referrerHost } from './referrer';

describe('referrerHost', () => {
  it('extracts the host only (drops path and query)', () => {
    expect(referrerHost('https://www.google.com/search?q=x', 'williamlin.dev')).toBe('www.google.com');
  });

  it('returns null for an internal referrer (own host)', () => {
    expect(referrerHost('https://williamlin.dev/fr', 'williamlin.dev')).toBeNull();
  });

  it('returns null for an empty referrer', () => {
    expect(referrerHost('', 'williamlin.dev')).toBeNull();
  });

  it('returns null for null/undefined', () => {
    expect(referrerHost(null, 'williamlin.dev')).toBeNull();
    expect(referrerHost(undefined, 'williamlin.dev')).toBeNull();
  });

  it('returns null for a malformed URL', () => {
    expect(referrerHost('not a url', 'williamlin.dev')).toBeNull();
  });
});
