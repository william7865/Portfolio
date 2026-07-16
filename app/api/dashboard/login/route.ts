import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSession, passwordMatches, sessionKey } from '@/lib/analytics/session';
import { SESSION_COOKIE } from '@/lib/analytics/guard';
import { readJsonCapped } from '@/lib/security/body';
import { clientIp, dbLimit } from '@/lib/security/ratelimit';

export const runtime = 'nodejs';

const schema = z.object({ password: z.string().min(1).max(200) });

const MAX_BODY_BYTES = 1024;

/** Per-IP, plus a deployment-wide ceiling so a botnet can't spread the guessing out. */
const PER_IP = { limit: 8, windowMs: 15 * 60 * 1000 };
const GLOBAL = { limit: 60, windowMs: 15 * 60 * 1000 };

function tooMany(retryAfterSec: number) {
  return NextResponse.json(
    { error: 'too-many-requests' },
    { status: 429, headers: { 'Retry-After': String(retryAfterSec) } }
  );
}

export async function POST(req: Request) {
  const password = process.env.DASHBOARD_PASSWORD;
  const secret = process.env.SESSION_SECRET;
  if (!password || !secret) {
    return NextResponse.json({ error: 'not-configured' }, { status: 500 });
  }

  // Count the attempt BEFORE reading the body or checking the password: the point
  // is to cap how many guesses an attacker gets, so every hit has to pay the counter.
  const ip = clientIp(req.headers);
  const perIp = await dbLimit(`login:ip:${ip}`, PER_IP.limit, PER_IP.windowMs);
  if (!perIp.ok) return tooMany(perIp.retryAfterSec);
  const global = await dbLimit('login:global', GLOBAL.limit, GLOBAL.windowMs);
  if (!global.ok) return tooMany(global.retryAfterSec);

  const body = await readJsonCapped(req, MAX_BODY_BYTES);
  if (!body.ok) {
    return NextResponse.json(
      { error: body.reason },
      { status: body.reason === 'too-large' ? 413 : 400 }
    );
  }

  const parsed = schema.safeParse(body.value);
  if (!parsed.success || !passwordMatches(secret, parsed.data.password, password)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createSession(sessionKey(secret, password), Date.now()), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60
  });
  return res;
}
