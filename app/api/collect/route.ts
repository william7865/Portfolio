import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSql } from '@/lib/analytics/db';
import { dailySalt, visitorHash } from '@/lib/analytics/hash';
import { parseDevice } from '@/lib/analytics/device';
import { referrerHost } from '@/lib/analytics/referrer';

export const runtime = 'nodejs';

const schema = z.object({
  path: z.string().min(1).max(512),
  lang: z.string().max(8).nullish(),
  referrer: z.string().max(2048).nullish()
});

const MAX_BODY_BYTES = 8 * 1024;

const noContent = () => new NextResponse(null, { status: 204 });

export async function POST(req: Request) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || !process.env.DATABASE_URL) return noContent();
  if (Number(req.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) {
    return new NextResponse(null, { status: 413 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return noContent();
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return noContent();

  try {
    const h = req.headers;
    // x-real-ip is set by the Vercel edge from the real connection and cannot be
    // spoofed by the client; x-forwarded-for's leftmost token can. Fall back to it
    // only for local/non-Vercel runs where x-real-ip is absent.
    const ip =
      h.get('x-real-ip')?.trim() ||
      (h.get('x-forwarded-for') ?? '').split(',')[0]?.trim() ||
      'unknown';
    const ua = h.get('user-agent') ?? '';
    const country = h.get('x-vercel-ip-country') || null;
    const ownHost = h.get('host') ?? '';

    const hash = visitorHash(ip, ua, dailySalt(secret, new Date()));
    const device = parseDevice(ua);
    const refHost = referrerHost(parsed.data.referrer ?? null, ownHost);
    const lang = parsed.data.lang ?? null;

    const sql = getSql();
    await sql`
      INSERT INTO events (visitor_hash, path, lang, referrer_host, country, device)
      VALUES (${hash}, ${parsed.data.path}, ${lang}, ${refHost}, ${country}, ${device})
    `;
  } catch (err) {
    console.error('[collect] insert failed', err);
  }

  return noContent();
}
