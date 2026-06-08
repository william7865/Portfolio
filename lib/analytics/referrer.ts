/** Host-only referrer. Returns null for direct, internal, empty or malformed referrers. */
export function referrerHost(
  referrer: string | null | undefined,
  ownHost: string
): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname;
    if (!host || host === ownHost) return null;
    return host;
  } catch {
    return null;
  }
}
