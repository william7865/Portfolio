import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSql } from '@/lib/analytics/db';
import { dailySalt, visitorHash } from '@/lib/analytics/hash';
import { parseDevice } from '@/lib/analytics/device';
import { referrerHost } from '@/lib/analytics/referrer';
import { readJsonCapped } from '@/lib/security/body';
import { clientIp, memoryLimit } from '@/lib/security/ratelimit';

export const runtime = 'nodejs';

const schema = z.object({
  path: z.string().min(1).max(512),
  lang: z.string().max(8).nullish(),
  referrer: z.string().max(2048).nullish()
});

const MAX_BODY_BYTES = 8 * 1024;

/**
 * Memory-based on purpose: one beacon per page view is high-volume, and a DB round
 * trip per hit to police DB writes would cost more than it saves. Per-instance
 * counting lets a determined flooder through, which for page-view stats means skewed
 * numbers on a private dashboard — not a breach. It still sheds the casual loop.
 */
const PER_IP = { limit: 60, windowMs: 60 * 1000 };

const noContent = () => new NextResponse(null, { status: 204 });

export async function POST(req: Request) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || !process.env.DATABASE_URL) return noContent();

  const ip = clientIp(req.headers);
  // 204, not 429: the beacon is fire-and-forget and never reads the status, and a
  // silent drop tells a flooder less about where the ceiling sits.
  if (!memoryLimit(`collect:ip:${ip}`, PER_IP.limit, PER_IP.windowMs).ok) return noContent();

  const body = await readJsonCapped(req, MAX_BODY_BYTES);
  if (!body.ok) {
    return body.reason === 'too-large' ? new NextResponse(null, { status: 413 }) : noContent();
  }

  const parsed = schema.safeParse(body.value);
  if (!parsed.success) return noContent();

  try {
    const h = req.headers;
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
