import { createHmac, timingSafeEqual } from 'node:crypto';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Constant-time string equality.
 *
 * The length check short-circuits, so this is constant-time in the CONTENT of `a`
 * and `b` but not in their length. Only use it where both sides are fixed-width
 * (HMAC hex) or where the length is not a secret (session tokens). To compare a
 * user-supplied secret, go through `passwordMatches`.
 */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/**
 * Signing key for session tokens: the server secret bound to the current password.
 *
 * Binding matters because the tokens are stateless — there is no server-side store to
 * clear. Folding the password in means rotating `DASHBOARD_PASSWORD` changes the key,
 * which retroactively invalidates every cookie signed under the old one instead of
 * leaving them valid for the rest of their 7-day TTL.
 */
export function sessionKey(secret: string, password: string): string {
  return createHmac('sha256', secret).update(`session|${password}`).digest('hex');
}

/**
 * Constant-time password check.
 *
 * Both sides are run through an HMAC first so the comparison is over two 64-char
 * digests. Comparing the raw strings would hit safeEqual's length short-circuit and
 * leak the real password's length to anyone timing the login endpoint.
 */
export function passwordMatches(secret: string, candidate: string, actual: string): boolean {
  const mac = (value: string) => createHmac('sha256', secret).update(`pw|${value}`).digest('hex');
  return safeEqual(mac(candidate), mac(actual));
}

function sign(secret: string, expiry: number): string {
  const mac = createHmac('sha256', secret).update(String(expiry)).digest('hex');
  return `${expiry}.${mac}`;
}

/** Build a session token valid for SESSION_TTL_MS from `now`. */
export function createSession(secret: string, now: number): string {
  return sign(secret, now + SESSION_TTL_MS);
}

/** Validate signature (constant time) and expiry. */
export function verifySession(secret: string, token: string | undefined, now: number): boolean {
  if (!token) return false;
  const dot = token.indexOf('.');
  if (dot < 0) return false;
  const expiry = Number(token.slice(0, dot));
  if (!Number.isFinite(expiry) || expiry < now) return false;
  return safeEqual(token, sign(secret, expiry));
}
