import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { readJsonCapped } from '@/lib/security/body';
import { clientIp, dbLimit } from '@/lib/security/ratelimit';

export const runtime = 'nodejs';

const MAX_BODY_BYTES = 16 * 1024;

const schema = z.object({
  name: z.string().min(2).max(100).regex(/^[^\r\n]+$/, 'no line breaks'),
  email: z.string().email().max(200),
  message: z.string().min(20).max(5000)
});

/**
 * This endpoint turns an anonymous POST into an email out of the owner's domain,
 * so it is a spam relay and a Resend-quota faucet unless it is metered. The global
 * ceiling is the one that matters: it bounds the monthly bill regardless of how many
 * addresses the sender rotates through.
 */
const PER_IP = { limit: 3, windowMs: 60 * 60 * 1000 };
const GLOBAL = { limit: 40, windowMs: 60 * 60 * 1000 };

function tooMany(retryAfterSec: number) {
  return NextResponse.json(
    { error: 'too-many-requests' },
    { status: 429, headers: { 'Retry-After': String(retryAfterSec) } }
  );
}

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? 'onboarding@resend.dev';
  if (!apiKey || !to) {
    return NextResponse.json({ error: 'server-not-configured' }, { status: 500 });
  }

  const ip = clientIp(req.headers);
  const perIp = await dbLimit(`contact:ip:${ip}`, PER_IP.limit, PER_IP.windowMs);
  if (!perIp.ok) return tooMany(perIp.retryAfterSec);
  const global = await dbLimit('contact:global', GLOBAL.limit, GLOBAL.windowMs);
  if (!global.ok) return tooMany(global.retryAfterSec);

  const body = await readJsonCapped(req, MAX_BODY_BYTES);
  if (!body.ok) {
    return NextResponse.json(
      { error: body.reason === 'too-large' ? 'payload-too-large' : 'invalid-json' },
      { status: body.reason === 'too-large' ? 413 : 400 }
    );
  }

  const parsed = schema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation' }, { status: 400 });
  }
  const { name, email, message } = parsed.data;
  const resend = new Resend(apiKey);
  try {
    await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `[Portfolio · Correspondance] ${name}`,
      text: `De : ${name} <${email}>\n\n${message}`
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'send-failed' }, { status: 502 });
  }
}
