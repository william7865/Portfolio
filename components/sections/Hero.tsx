'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { GoldDust } from '@/components/motifs/GoldDust';
import { SilkVeil } from '@/components/motifs/SilkVeil';
import { Seal } from '@/components/motifs/Seal';
import { useEasterEgg } from '@/components/providers/EasterEggProvider';
import { useIdlePulse } from '@/lib/useIdlePulse';

export function Hero() {
  const t = useTranslations('hero');
  const { sealClick } = useEasterEgg();
  const [pulseKey, setPulseKey] = useState(0);
  const idlePulse = useIdlePulse(30_000);

  function handleSealClick() {
    setPulseKey((k) => k + 1);
    sealClick();
  }

  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  // Background hanzi drifts up + scales slightly, fades into vermillon
  const bgHanziY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);
  const bgHanziOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.15]);
  const bgHanziScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  // Foreground content lifts and fades
  const fgY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const fgOpacity = useTransform(scrollYProgress, [0, 0.6, 0.9], [1, 0.6, 0]);
  // Silk veil narrows as you scroll away (roll-up effect)
  const veilScale = useTransform(scrollYProgress, [0, 1], [1, 0.6]);
  const veilOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  // Scroll cue fades immediately on first scroll
  const cueOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  return (
    <section
      ref={ref}
      aria-label="Prologue"
      className="relative min-h-screen w-full overflow-hidden flex items-center"
    >
      <motion.div
        aria-hidden="true"
        className="font-display-hanzi pointer-events-none absolute select-none will-change-transform"
        style={{
          right: 'clamp(-2rem, -3vw, 2rem)',
          top: 'clamp(2rem, 6vw, 5rem)',
          fontSize: 'clamp(12rem, 32vw, 28rem)',
          lineHeight: 1,
          color: 'transparent',
          WebkitTextStroke: '1px rgba(212,175,55,0.45)',
          y: bgHanziY,
          opacity: bgHanziOpacity,
          scale: bgHanziScale
        }}
      >
        林
      </motion.div>

      <motion.div
        style={{ scale: veilScale, opacity: veilOpacity }}
        className="absolute inset-0 pointer-events-none"
      >
        <SilkVeil />
      </motion.div>
      <GoldDust count={14} />

      <motion.div
        style={{ y: fgY, opacity: fgOpacity }}
        className="relative z-10 w-full max-w-6xl mx-auto px-6 lg:px-10 pt-32 pb-16"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="kicker mb-12"
        >
          {t('kicker')}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="hero-display max-w-4xl"
        >
          William <em>Lin</em>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="mt-10 max-w-md"
        >
          <p className="lede italic mb-4">{t('lede')}</p>
          <p className="kicker-mono opacity-70">{t('role')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1.1, ease: [0.34, 1.56, 0.64, 1] }}
          className="mt-10 inline-block"
        >
          <div className="relative inline-block">
            <AnimatePresence>
              {pulseKey > 0 && (
                <motion.span
                  key={pulseKey}
                  initial={{ scale: 1, opacity: 0.65 }}
                  animate={{ scale: 2.4, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'var(--color-cinnabar)',
                    borderRadius: 2,
                    transform: 'rotate(-6deg)',
                    zIndex: 0
                  }}
                />
              )}
            </AnimatePresence>
            <motion.div
              key={`idle-${idlePulse}`}
              animate={
                idlePulse > 0
                  ? { scale: [1, 1.08, 0.98, 1.04, 1] }
                  : { scale: 1 }
              }
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.88 }}
              transition={
                idlePulse > 0
                  ? { duration: 1.4, times: [0, 0.3, 0.55, 0.8, 1], ease: 'easeOut' }
                  : { type: 'spring', stiffness: 500, damping: 18 }
              }
              className="relative"
              style={{ zIndex: 1 }}
            >
              <Seal
                glyph="林"
                size={64}
                rotate={-6}
                onClick={handleSealClick}
                ariaLabel="William Lin signature seal"
              />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        style={{ opacity: cueOpacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.6 }}
        className="absolute bottom-10 left-6 lg:left-10 flex flex-col items-start gap-3 z-10"
      >
        <span className="kicker-mono opacity-60">↓ {t('scrollCue')}</span>
        <span className="block w-px h-16 bg-gradient-to-b from-[var(--color-gold)] to-transparent" />
      </motion.div>
    </section>
  );
}
