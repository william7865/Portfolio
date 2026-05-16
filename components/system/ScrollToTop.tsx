'use client';

import { AnimatePresence, motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';
import { useSfxContext } from '@/components/providers/SfxProvider';

/**
 * Cinnabar seal returning the user to the prologue.
 * Fades in after the first viewport-height of scroll.
 */
export function ScrollToTop() {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);
  const { play } = useSfxContext();

  useMotionValueEvent(scrollY, 'change', (v) => {
    const trigger = typeof window !== 'undefined' ? window.innerHeight * 0.65 : 600;
    setVisible(v > trigger);
  });

  const rotate = useTransform(scrollY, [0, 3000], [-6, -22]);

  function backToTop() {
    play('tap', 0.35);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={backToTop}
          aria-label="Retour au prologue"
          title="Retour au prologue"
          initial={{ opacity: 0, y: 20, scale: 0.7 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.7 }}
          transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-8 right-8 z-50"
          style={{ rotate: undefined }}
        >
          <motion.span
            className="seal block"
            style={{
              width: 48,
              height: 48,
              fontSize: 22,
              rotate
            }}
          >
            上
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
