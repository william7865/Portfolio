import { createHmac, timingSafeEqual } from 'node:crypto';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Constant-time string equality. */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
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
