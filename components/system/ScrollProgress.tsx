'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * Thin gold hairline at the very top of the viewport, fills as the user scrolls.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX, transformOrigin: '0% 50%' }}
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] bg-gradient-to-r from-transparent via-[var(--color-gold-bright)] to-transparent pointer-events-none"
    />
  );
}
