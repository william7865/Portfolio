'use client';

import { useEffect, useRef } from 'react';

const MAX_DOTS = 40;

/**
 * Gold-ink cursor trail. Native cursor preserved. Dots fade behind motion.
 * Throttled to ~60fps. Disabled on touch devices and via prefers-reduced-motion.
 * Caps the live dot count at MAX_DOTS to prevent DOM-node growth under heavy movement.
 */
export function InkCursor() {
  const lastSpawn = useRef(0);
  const liveDots = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    const isTouch = matchMedia('(pointer: coarse)').matches;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || reduce) return;

    function onMove(e: MouseEvent) {
      const now = performance.now();
      if (now - lastSpawn.current < 30) return;
      lastSpawn.current = now;

      // Evict the oldest dot if we're at the cap
      if (liveDots.current.length >= MAX_DOTS) {
        const oldest = liveDots.current.shift();
        oldest?.remove();
      }

      const dot = document.createElement('span');
      dot.className = 'ink-dot';
      dot.style.left = e.clientX + 'px';
      dot.style.top = e.clientY + 'px';
      document.body.appendChild(dot);
      liveDots.current.push(dot);

      setTimeout(() => {
        const idx = liveDots.current.indexOf(dot);
        if (idx >= 0) liveDots.current.splice(idx, 1);
        dot.remove();
      }, 950);
    }

    function cleanup() {
      liveDots.current.forEach((d) => d.remove());
      liveDots.current = [];
    }

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('blur', cleanup);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('blur', cleanup);
      cleanup();
    };
  }, []);

  return null;
}
