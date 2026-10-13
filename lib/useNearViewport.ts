'use client';

import { useEffect, useState, type RefObject } from 'react';

/**
 * Turns true, once, when the element comes within `rootMargin` of the viewport
 * and the page itself has finished loading. Used to hold back heavy media
 * (scene clips and their stills) so it does not compete with the first screen.
 */
export function useNearViewport(ref: RefObject<Element | null>, rootMargin = '250% 0px') {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;

    const arrive = () => setNear(true);
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        io.disconnect();
        if (document.readyState === 'complete') arrive();
        else window.addEventListener('load', arrive, { once: true });
      },
      { rootMargin }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      window.removeEventListener('load', arrive);
    };
  }, [ref, rootMargin, near]);

  return near;
}
