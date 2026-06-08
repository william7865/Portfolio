import { describe, it, expect } from 'vitest';
import { dailySalt, visitorHash } from './hash';

const SECRET = 'test-secret';
const DAY1 = new Date('2026-06-08T10:00:00Z');
const DAY2 = new Date('2026-06-09T10:00:00Z');

describe('dailySalt', () => {
  it('is stable within the same UTC day', () => {
    const a = dailySalt(SECRET, new Date('2026-06-08T01:00:00Z'));
    const b = dailySalt(SECRET, new Date('2026-06-08T23:00:00Z'));
    expect(a).toBe(b);
  });

  it('rotates across days', () => {
    expect(dailySalt(SECRET, DAY1)).not.toBe(dailySalt(SECRET, DAY2));
  });
});

describe('visitorHash', () => {
  it('is deterministic for the same inputs', () => {
    const salt = dailySalt(SECRET, DAY1);
    expect(visitorHash('1.2.3.4', 'UA', salt)).toBe(visitorHash('1.2.3.4', 'UA', salt));
  });

  it('differs across days for the same visitor', () => {
    expect(visitorHash('1.2.3.4', 'UA', dailySalt(SECRET, DAY1))).not.toBe(
      visitorHash('1.2.3.4', 'UA', dailySalt(SECRET, DAY2))
    );
  });

  it('never leaks the raw IP', () => {
    const salt = dailySalt(SECRET, DAY1);
    expect(visitorHash('203.0.113.5', 'UA', salt)).not.toContain('203.0.113.5');
  });

  it('returns a 16-char hex string', () => {
    const salt = dailySalt(SECRET, DAY1);
    expect(visitorHash('1.2.3.4', 'UA', salt)).toMatch(/^[0-9a-f]{16}$/);
  });
});
