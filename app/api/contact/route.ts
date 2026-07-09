import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

const MAX_BODY_BYTES = 16 * 1024;

const schema = z.object({
  name: z.string().min(2).max(100).regex(/^[^\r\n]+$/, 'no line breaks'),
  email: z.string().email().max(200),
  message: z.string().min(20).max(5000)
});

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? 'onboarding@resend.dev';
  if (!apiKey || !to) {
    return NextResponse.json({ error: 'server-not-configured' }, { status: 500 });
  }
  if (Number(req.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'payload-too-large' }, { status: 413 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
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
