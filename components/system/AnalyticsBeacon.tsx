'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Fires one anonymous page-view to /api/collect on mount and on each route change. */
export function AnalyticsBeacon({ lang }: { lang: string }) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.doNotTrack === '1') return;

    const payload = JSON.stringify({
      path: pathname,
      lang,
      referrer: document.referrer || null
    });

    try {
      const blob = new Blob([payload], { type: 'application/json' });
      if (navigator.sendBeacon?.('/api/collect', blob)) return;
    } catch {
      // fall through to fetch
    }

    fetch('/api/collect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true
    }).catch(() => {});
  }, [pathname, lang]);

  return null;
}
