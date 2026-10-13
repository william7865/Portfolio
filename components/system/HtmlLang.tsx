'use client';

import { useEffect } from 'react';

/**
 * Keeps `<html lang>` in step with the locale. The inline script in the layout
 * covers the first paint; this covers what it cannot: switching language without
 * a full page load, and pages React renders on the client (the 404).
 */
export function HtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
