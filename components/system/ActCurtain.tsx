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
  const scale = useTransform(scrollYProgress, [0.1, 0.5, 0.9], [0.86, 1.02, 1.12]);
  const yLabel = useTransform(scrollYProgress, [0.1, 0.9], [60, -60]);
  // Curtain panels part as the user scrolls through
  const leftX = useTransform(scrollYProgress, [0.2, 0.7], ['0%', '-22%']);
  const rightX = useTransform(scrollYProgress, [0.2, 0.7], ['0%', '22%']);
  const curtainOpacity = useTransform(scrollYProgress, [0, 0.3, 0.9], [1, 0.95, 0.4]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen overflow-hidden flex items-center justify-center"
      aria-label={label}
    >
      {/* Two-panel silk curtain that parts as user scrolls */}
      <motion.div
        aria-hidden="true"
        style={{ x: leftX, opacity: curtainOpacity }}
        className="absolute top-0 bottom-0 left-0 w-1/2 pointer-events-none will-change-transform"
      >
        <div
          className="w-full h-full"
          style={{
            background:
              'repeating-linear-gradient(180deg, rgba(212,175,55,0.16) 0 1px, transparent 1px 9px), linear-gradient(90deg, var(--color-vermillion) 0%, var(--color-vermillion-bright) 100%)',
            boxShadow: 'inset -30px 0 50px rgba(0,0,0,0.4)'
          }}
        />
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[var(--color-gold)] via-[var(--color-gold-deep)] to-[var(--color-gold)]" />
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--color-gold)] via-[var(--color-gold-deep)] to-[var(--color-gold)]" />
      </motion.div>
      <motion.div
        aria-hidden="true"
        style={{ x: rightX, opacity: curtainOpacity }}
        className="absolute top-0 bottom-0 right-0 w-1/2 pointer-events-none will-change-transform"
      >
        <div
          className="w-full h-full"
          style={{
            background:
              'repeating-linear-gradient(180deg, rgba(212,175,55,0.16) 0 1px, transparent 1px 9px), linear-gradient(270deg, var(--color-vermillion) 0%, var(--color-vermillion-bright) 100%)',
            boxShadow: 'inset 30px 0 50px rgba(0,0,0,0.4)'
          }}
        />
        <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[var(--color-gold)] via-[var(--color-gold-deep)] to-[var(--color-gold)]" />
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--color-gold)] via-[var(--color-gold-deep)] to-[var(--color-gold)]" />
      </motion.div>

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
