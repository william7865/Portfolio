import { describe, it, expect } from 'vitest';
import { createSession, verifySession, safeEqual, sessionKey, passwordMatches } from './session';

const SECRET = 'test-secret';
const NOW = 1_700_000_000_000;

describe('session token', () => {
  it('round-trips a freshly created token', () => {
    const token = createSession(SECRET, NOW);
    expect(verifySession(SECRET, token, NOW)).toBe(true);
  });

  it('rejects a tampered token', () => {
    const token = createSession(SECRET, NOW);
    const tampered = token.slice(0, -1) + (token.endsWith('0') ? '1' : '0');
    expect(verifySession(SECRET, tampered, NOW)).toBe(false);
  });

  it('rejects an expired token', () => {
    const token = createSession(SECRET, NOW);
    const eightDaysLater = NOW + 8 * 24 * 60 * 60 * 1000;
    expect(verifySession(SECRET, token, eightDaysLater)).toBe(false);
  });

  it('rejects a token signed with another secret', () => {
    const token = createSession('other-secret', NOW);
    expect(verifySession(SECRET, token, NOW)).toBe(false);
  });

  it('rejects undefined / malformed tokens', () => {
    expect(verifySession(SECRET, undefined, NOW)).toBe(false);
    expect(verifySession(SECRET, 'garbage', NOW)).toBe(false);
  });
});

describe('safeEqual', () => {
  it('is true for equal strings and false otherwise', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('abc', 'abd')).toBe(false);
    expect(safeEqual('abc', 'abcd')).toBe(false);
  });
});

describe('sessionKey', () => {
  it('is stable for the same secret and password', () => {
    expect(sessionKey(SECRET, 'pw')).toBe(sessionKey(SECRET, 'pw'));
  });

  it('changes when the password changes', () => {
    expect(sessionKey(SECRET, 'pw')).not.toBe(sessionKey(SECRET, 'pw2'));
  });

  it('changes when the secret changes', () => {
    expect(sessionKey('other', 'pw')).not.toBe(sessionKey(SECRET, 'pw'));
  });

  // The point of the whole indirection: rotating a leaked password must hang up
  // every cookie already handed out, not leave them live for the 7-day TTL.
  it('invalidates tokens minted under the previous password', () => {
    const token = createSession(sessionKey(SECRET, 'old-pw'), NOW);
    expect(verifySession(sessionKey(SECRET, 'old-pw'), token, NOW)).toBe(true);
    expect(verifySession(sessionKey(SECRET, 'new-pw'), token, NOW)).toBe(false);
  });
});

describe('passwordMatches', () => {
  it('accepts the right password and rejects the wrong one', () => {
    expect(passwordMatches(SECRET, 'hunter2', 'hunter2')).toBe(true);
    expect(passwordMatches(SECRET, 'hunter3', 'hunter2')).toBe(false);
  });

  // safeEqual short-circuits on length, so comparing raw strings leaked the
  // password's length to anyone timing the endpoint. HMACs are always 64 hex chars.
  it('rejects a wrong-length guess without a length short-circuit', () => {
    expect(passwordMatches(SECRET, 'x', 'hunter2')).toBe(false);
    expect(passwordMatches(SECRET, 'x'.repeat(200), 'hunter2')).toBe(false);
  });

  it('is not fooled by a guess that equals the stored HMAC', () => {
    expect(passwordMatches(SECRET, sessionKey(SECRET, 'hunter2'), 'hunter2')).toBe(false);
  });
});
