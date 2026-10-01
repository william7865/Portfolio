'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { GoldDust } from '@/components/motifs/GoldDust';
import { SceneVideo } from '@/components/motifs/SceneVideo';
import { useScrollRange } from '@/lib/useScrollRange';

/**
 * Palace gate between Act III and the Correspondance.
 *
 * Scroll-bound, pinned for ~160vh. On scrollYProgress:
 *   0.05 – 0.90  the doors swing open, then the camera walks down the hall
 *   0.05 – 0.22  the captions fade
 *   0.62 – 0.92  a full-viewport wash hands off to the next section
 *
 * The wash is the mirror of the Correspondance background (bright at the seam),
 * so the release of the sticky container reads as continuous light.
 */
export function Gate() {
  const t = useTranslations('gate');
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  const walk = useScrollRange(scrollYProgress, [0.05, 0.9], [0, 1]);
  const wash = useScrollRange(scrollYProgress, [0.62, 0.92], [0, 1]);
  const caption = useScrollRange(scrollYProgress, [0.05, 0.22], [1, 0]);

  return (
    <section
      ref={ref}
      aria-label={t('kicker')}
      className="relative"
      style={{ height: reduce ? '100vh' : '260vh' }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div aria-hidden="true" className="scene-fade-y absolute inset-0 pointer-events-none">
          <SceneVideo scene="gate" progress={walk} />
          <GoldDust count={18} />
        </div>

        {/* Room light: takes over the viewport at the end of the walk */}
        <motion.div
          aria-hidden="true"
          className="gate-wash absolute inset-0 pointer-events-none"
          style={{ opacity: reduce ? 0 : wash }}
        />

        {/* Captions */}
        <motion.div
          className="absolute top-24 inset-x-0 text-center kicker pointer-events-none"
          style={{ opacity: reduce ? 1 : caption }}
        >
          {t('kicker')}
        </motion.div>
        <motion.div
          className="absolute bottom-10 inset-x-0 text-center pointer-events-none"
          style={{ opacity: reduce ? 0 : caption }}
        >
          <span className="kicker-mono opacity-60">↓ {t('label')}</span>
        </motion.div>
      </div>
    </section>
  );
}
