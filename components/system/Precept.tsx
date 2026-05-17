'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

type Props = {
  roman: string;
  han: string;
  label: string;
  text: string;
  /** Stagger delay in seconds for the in-view animation. */
  delay?: number;
};

/**
 * A single row of the stele. Lights up (gold light-pass on the hanzi)
 * while the row is in view, then settles when scrolled past.
 */
export function Precept({ roman, han, label, text, delay = 0 }: Props) {
  const ref = useRef<HTMLLIElement | null>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setActive(entry.isIntersecting);
        }
      },
      { threshold: 0.55, rootMargin: '-15% 0px -15% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  return (
    <motion.li
      ref={ref}
      data-active={active ? 'true' : 'false'}
      className="precept relative grid items-center gap-5 py-5"
      style={{ gridTemplateColumns: '28px 84px 1fr' }}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="font-mono text-[0.62rem] tracking-[0.22em] text-[var(--color-gold)] opacity-70 text-center self-start pt-3">
        {roman}
      </span>
      <span
        className="precept-han text-center"
        style={{ fontSize: 'clamp(2.6rem, 5vw, 3.6rem)' }}
        aria-hidden="true"
      >
        {han}
      </span>
      <div className="pl-1">
        <div
          className="font-display italic text-[var(--color-gold-bright)]"
          style={{ fontSize: 'clamp(1.15rem, 1.6vw, 1.4rem)', lineHeight: 1 }}
        >
          {label}
        </div>
        <p className="font-display text-[var(--color-ivory)] mt-1.5 leading-relaxed text-[0.98rem] md:text-[1.02rem]">
          {text}
        </p>
      </div>
    </motion.li>
  );
}
