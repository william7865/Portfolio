'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

type Props = {
  hanzi: string;
  label: string;
  /** Optional subtitle below the act marker. */
  subtitle?: string;
};

/**
 * Full-height curtain transition between acts.
 * The hanzi marker fades in / scales / fades out as the user scrolls through.
 */
export function ActCurtain({ hanzi, label, subtitle }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.25, 0.6, 1],
    [0, 1, 1, 0]
  );
  const scale = useTransform(scrollYProgress, [0.1, 0.5, 0.9], [0.92, 1, 1.04]);
  const yLabel = useTransform(scrollYProgress, [0.1, 0.9], [40, -40]);

  return (
    <section
      ref={ref}
      className="relative min-h-[80vh] overflow-hidden flex items-center justify-center"
      aria-label={label}
    >
      {/* Silk pinstripes curtain */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'repeating-linear-gradient(180deg, rgba(212,175,55,0.14) 0 1px, transparent 1px 9px), linear-gradient(180deg, var(--color-vermillion) 0%, var(--color-vermillion-bright) 50%, var(--color-vermillion) 100%)'
        }}
      />
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[var(--color-gold)] via-[var(--color-gold-deep)] to-[var(--color-gold)]"
      />
      <div
        aria-hidden="true"
        className="absolute right-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[var(--color-gold)] via-[var(--color-gold-deep)] to-[var(--color-gold)]"
      />

      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 text-center px-6"
      >
        <div className="act-marker">{hanzi}</div>
        <motion.div
          style={{ y: yLabel }}
          className="kicker mt-6"
        >
          {label}
        </motion.div>
        {subtitle && (
          <motion.div
            style={{ y: yLabel }}
            className="lede italic mt-3 text-[var(--color-gold-bright)] opacity-70 max-w-md mx-auto"
          >
            {subtitle}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
