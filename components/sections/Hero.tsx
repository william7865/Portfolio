'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { GoldDust } from '@/components/motifs/GoldDust';
import { SilkVeil } from '@/components/motifs/SilkVeil';
import { Seal } from '@/components/motifs/Seal';
import { useEasterEgg } from '@/components/providers/EasterEggProvider';

export function Hero() {
  const t = useTranslations('hero');
  const { sealClick } = useEasterEgg();
  const [pulseKey, setPulseKey] = useState(0);

  function handleSealClick() {
    setPulseKey((k) => k + 1);
    sealClick();
  }

  return (
    <section
      aria-label="Prologue"
      className="relative min-h-screen w-full overflow-hidden flex items-center"
    >
      {/* Background decorative hanzi (Lin = forest) */}
      <div
        aria-hidden="true"
        className="font-display-hanzi pointer-events-none absolute select-none"
        style={{
          right: 'clamp(-2rem, -3vw, 2rem)',
          top: 'clamp(2rem, 6vw, 5rem)',
          fontSize: 'clamp(12rem, 32vw, 28rem)',
          lineHeight: 1,
          color: 'transparent',
          WebkitTextStroke: '1px rgba(212,175,55,0.45)'
        }}
      >
        林
      </div>

      <SilkVeil />
      <GoldDust count={14} />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 lg:px-10 pt-32 pb-16">
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
            {/* Click ripple — fires once per click via key */}
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.88 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
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

        {/* Scroll cue at bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.6 }}
          className="absolute bottom-10 left-6 lg:left-10 flex flex-col items-start gap-3"
        >
          <span className="kicker-mono opacity-60">↓ {t('scrollCue')}</span>
          <span className="block w-px h-16 bg-gradient-to-b from-[var(--color-gold)] to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
