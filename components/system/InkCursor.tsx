'use client';

import { useEffect, useRef } from 'react';

/**
 * Gold-ink cursor trail. Native cursor preserved. Dots fade behind motion.
 * Throttled to ~60fps. Disabled on touch devices and via prefers-reduced-motion.
 */
export function InkCursor() {
  const lastSpawn = useRef(0);
  const enabled = useRef(true);

  useEffect(() => {
    // Touch / coarse pointer detection
    const isTouch = matchMedia('(pointer: coarse)').matches;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || reduce) {
      enabled.current = false;
      return;
    }

    function onMove(e: MouseEvent) {
      const now = performance.now();
      if (now - lastSpawn.current < 30) return;
      lastSpawn.current = now;
      const dot = document.createElement('span');
      dot.className = 'ink-dot';
      dot.style.left = e.clientX + 'px';
      dot.style.top = e.clientY + 'px';
      document.body.appendChild(dot);
      setTimeout(() => dot.remove(), 950);
    }

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return null;
}
