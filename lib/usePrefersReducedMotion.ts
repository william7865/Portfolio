'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

/**
 * Whether the visitor asked for reduced motion.
 *
 * framer-motion's `useReducedMotion` already answers `true` on the first
 * client render, while the server rendered the animated markup: sections that
 * swap a clip for a still then fail hydration. This one reports `false` until
 * hydration is done, so both renders match, and switches right after.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );
}
