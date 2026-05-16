'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslations } from 'next-intl';

export function Gate() {
  const t = useTranslations('gate');
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  const scale = useTransform(scrollYProgress, [0, 0.4, 0.85, 1], [0.65, 1, 3.6, 6]);
  const rotateX = useTransform(scrollYProgress, [0, 0.45, 1], [10, 3, -6]);
  const opacity = useTransform(scrollYProgress, [0, 0.12, 0.82, 1], [0, 1, 1, 0]);
  const glow = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0]);
  const innerOpacity = useTransform(scrollYProgress, [0.55, 0.9], [1, 0]);

  return (
    <section
      ref={ref}
      aria-label="The Gate"
      className="relative"
      style={{ height: '120vh' }}
    >
      <div
        className="sticky top-0 h-screen overflow-hidden flex items-center justify-center"
        style={{ perspective: '700px', perspectiveOrigin: '50% 55%' }}
      >
        {/* Floor light */}
        <motion.div
          aria-hidden="true"
          style={{ opacity: glow }}
          className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[160%] h-1/2 pointer-events-none"
        >
          <div
            className="w-full h-full"
            style={{
              background:
                'radial-gradient(60% 60% at 50% 100%, rgba(233,196,106,0.45) 0%, rgba(212,175,55,0.15) 30%, transparent 60%)'
            }}
          />
        </motion.div>

        {/* Kicker */}
        <motion.div
          style={{ opacity }}
          className="absolute top-24 inset-x-0 text-center kicker"
        >
          {t('kicker')}
        </motion.div>

        {/* Gate */}
        <motion.div
          style={{
            scale,
            rotateX,
            opacity,
            transformStyle: 'preserve-3d',
            willChange: 'transform, opacity'
          }}
          className="relative w-[260px] h-[300px] md:w-[320px] md:h-[380px]"
        >
          {/* Roof / lintel */}
          <div
            aria-hidden="true"
            className="absolute -top-7 -left-6 -right-6 h-7"
            style={{
              background: 'linear-gradient(180deg, var(--color-gold) 0%, var(--color-gold-deep) 100%)',
              clipPath: 'polygon(0 100%, 8% 0, 92% 0, 100% 100%)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.4)'
            }}
          />
          {/* Outer frame */}
          <div
            className="absolute inset-0 border-2 border-[var(--color-gold)]"
            style={{
              background:
                'linear-gradient(180deg, transparent 0%, rgba(74,10,14,0.7) 100%)',
              boxShadow:
                '0 0 0 4px var(--color-vermillion), 0 0 0 5px var(--color-gold), 0 0 40px rgba(212,175,55,0.4)'
            }}
          >
            {/* Inner frame */}
            <motion.div
              style={{ opacity: innerOpacity }}
              className="absolute inset-3 border border-[var(--color-gold)]/55 flex flex-col items-center justify-center gap-3"
            >
              <span className="kicker-mono text-[10px]">太和</span>
              <span
                className="font-display-hanzi text-[var(--color-gold-bright)]"
                style={{
                  fontSize: '7rem',
                  lineHeight: 1,
                  textShadow: '0 0 24px rgba(233,196,106,0.6)'
                }}
              >
                入
              </span>
              <span className="kicker-mono text-[10px] opacity-70">{t('label')}</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
