import { createHash } from 'node:crypto';

/** Salt that changes every UTC day, derived from the server secret. */
export function dailySalt(secret: string, date: Date): string {
  const day = date.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  return createHash('sha256').update(`${secret}|${day}`).digest('hex');
}

/** Anonymous, daily-rotating visitor id. The raw IP is never stored. */
export function visitorHash(ip: string, userAgent: string, salt: string): string {
  return createHash('sha256')
    .update(`${ip}|${userAgent}|${salt}`)
    .digest('hex')
    .slice(0, 16);
}
