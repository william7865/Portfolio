'use client';

import { useEffect, useState } from 'react';

/**
 * SSR-safe responsive hook. Starts as `false` so server-render matches mobile-first
 * desktop assumption; flips after mount if `(max-width: <breakpoint>px)` matches.
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [breakpoint]);

  return isMobile;
}
