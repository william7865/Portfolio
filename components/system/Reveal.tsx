'use client';

import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  /** Delay in seconds before animation starts. */
  delay?: number;
  /** Y offset to slide from (px). */
  y?: number;
  /** Duration in seconds. */
  duration?: number;
  /** Trigger only the first time the element enters viewport. */
  once?: boolean;
};

const variants: Variants = {
  hidden: ({ y }: { y: number }) => ({ opacity: 0, y }),
  show: ({ duration, delay }: { duration: number; delay: number }) => ({
    opacity: 1,
    y: 0,
    transition: { duration, delay, ease: [0.16, 1, 0.3, 1] }
  })
};

/**
 * Slides children up + fades in when the element first enters viewport.
 */
export function Reveal({
  children,
  className = '',
  delay = 0,
  y = 24,
  duration = 0.9,
  once = true
}: Props) {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: '-10% 0px -10% 0px' }}
      custom={{ y, duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
