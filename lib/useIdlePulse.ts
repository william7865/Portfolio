'use client';

import { useEffect, useState } from 'react';

/**
 * Returns a numeric "pulse counter" that increments each time `idleMs` of
 * user inactivity (no mousemove, scroll, key, touch) is reached.
 * Lets the caller animate a one-shot pulse keyed off the counter.
 */
export function useIdlePulse(idleMs = 30_000) {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let timer: ReturnType<typeof setTimeout> | null = null;

    function arm() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setPulse((n) => n + 1), idleMs);
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'] as const;
    events.forEach((e) => window.addEventListener(e, arm, { passive: true }));
    arm();

    return () => {
      if (timer) clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, arm));
    };
  }, [idleMs]);

  return pulse;
}
