import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/analytics/guard';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL('/dashboard/login', req.url));
  res.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}
