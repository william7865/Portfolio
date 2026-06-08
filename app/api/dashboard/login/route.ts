import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSession, safeEqual } from '@/lib/analytics/session';
import { SESSION_COOKIE } from '@/lib/analytics/guard';

export const runtime = 'nodejs';

const schema = z.object({ password: z.string().min(1).max(200) });

export async function POST(req: Request) {
  const password = process.env.DASHBOARD_PASSWORD;
  const secret = process.env.SESSION_SECRET;
  if (!password || !secret) {
    return NextResponse.json({ error: 'not-configured' }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success || !safeEqual(parsed.data.password, password)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createSession(secret, Date.now()), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60
  });
  return res;
}
