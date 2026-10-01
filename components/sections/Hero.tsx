'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion, useReducedMotion, useScroll } from 'framer-motion';
import { SceneVideo } from '@/components/motifs/SceneVideo';
import { Seal } from '@/components/motifs/Seal';
import { useEasterEgg } from '@/components/providers/EasterEggProvider';
import { useIdlePulse } from '@/lib/useIdlePulse';
import { useScrollRange } from '@/lib/useScrollRange';

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Prologue. The lacquer desk filmed from above: the tools lined up along the
 * top, the handscroll still tied shut (Act I is that scroll being unrolled),
 * the window's shadow drifting. The name sits on the bare lacquer below.
 */
export function Hero() {
  const t = useTranslations('hero');
  const reduce = useReducedMotion();
  const { sealClick } = useEasterEgg();
  const [pulseKey, setPulseKey] = useState(0);
  const idlePulse = useIdlePulse(30_000);

  function handleSealClick() {
    setPulseKey((k) => k + 1);
    sealClick();
  }

  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const deskY = useScrollRange(scrollYProgress, [0, 1], ['0%', '12%']);
  const fgY = useScrollRange(scrollYProgress, [0, 1], [0, -80]);
  const fgOpacity = useScrollRange(scrollYProgress, [0, 0.6, 0.9], [1, 0.6, 0]);

  return (
    <section
      ref={ref}
      aria-label="William Lin"
      className="relative min-h-[100svh] w-full overflow-hidden flex items-end"
    >
      <motion.div
        aria-hidden="true"
        style={{ y: deskY }}
        className="absolute inset-0 pointer-events-none"
      >
        {/* Phones show a tall slice: inkstone and seal paste */}
        <SceneVideo scene="hero" priority className="object-[78%_50%] md:object-center" />
        <div className="hero-desk-tone absolute inset-0" />
      </motion.div>

      <motion.div
        style={{ y: fgY, opacity: fgOpacity }}
        className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 pt-28 pb-14 md:pb-20"
      >
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
          className="md:max-w-[70%]"
        >
          <h1 className="hero-name">
            William Lin
          </h1>

          <div className="mt-7 md:mt-10 max-w-md">
            <p className="lede" style={{ opacity: 1 }}>
              {t('role')}
            </p>
            <p className="lede mt-2" style={{ opacity: 0.92 }}>
              {t('lede')}
            </p>
          </div>

          <div className="mt-7 md:mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <nav aria-label="William Lin" className="flex flex-wrap gap-x-8 gap-y-3">
              <a className="hero-link" href="#projets">
                {t('links.projects')}
              </a>
              <a className="hero-link" href="#contact">
                {t('links.contact')}
              </a>
              <a className="hero-link" href="/CV.pdf" target="_blank" rel="noopener noreferrer">
                {t('links.cv')}
              </a>
            </nav>

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
                animate={idlePulse > 0 ? { scale: [1, 1.08, 0.98, 1.04, 1] } : { scale: 1 }}
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
                  size={44}
                  rotate={-6}
                  onClick={handleSealClick}
                  ariaLabel="William Lin signature seal"
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
