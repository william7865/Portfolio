'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

export function MatchPointScene({
  visible,
  onClose
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const t = useTranslations('score');
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-label="Match point celebration"
          className="fixed inset-0 z-[10000] bg-paper/95 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {typeof window !== 'undefined' &&
            Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  y: -50,
                  x: Math.random() * window.innerWidth,
                  opacity: 1,
                  rotate: 0
                }}
                animate={{ y: window.innerHeight + 50, rotate: 360 }}
                transition={{ duration: 2 + Math.random(), ease: 'easeIn' }}
                style={{
                  position: 'absolute',
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: 'var(--color-shuttle)',
                  border: '1px solid var(--color-ink)'
                }}
              />
            ))}
          <h2 className="font-display italic text-8xl text-ink">{t('matchPoint')}</h2>
          <button onClick={onClose} className="mt-8 font-mono text-xs underline text-ink">
            {t('continue')}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
