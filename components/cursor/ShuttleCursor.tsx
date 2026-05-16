'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useReducedMotion } from '@/lib/reduced-motion';
import { spawnFeather, pruneFeathers, type Feather } from './shuttle-trail';

export function ShuttleCursor() {
  const reduced = useReducedMotion();
  const [coarse, setCoarse] = useState(false);
  const [trail, setTrail] = useState<Feather[]>([]);
  const [smashing, setSmashing] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 350, damping: 28, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 350, damping: 28, mass: 0.5 });
  const lastSpawn = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setCoarse(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  useEffect(() => {
    if (reduced || coarse) return;
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const now = performance.now();
      if (now - lastSpawn.current > 40) {
        lastSpawn.current = now;
        setTrail((t) => spawnFeather(t, e.clientX, e.clientY, now));
      }
    };
    const onClick = () => {
      setSmashing(true);
      window.setTimeout(() => setSmashing(false), 120);
    };
    const tick = window.setInterval(
      () => setTrail((t) => pruneFeathers(t, performance.now())),
      80
    );
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onClick);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onClick);
      window.clearInterval(tick);
    };
  }, [reduced, coarse, x, y]);

  if (reduced || coarse) return null;

  return (
    <>
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-[9998]">
        {trail.map((f) => {
          const age = (performance.now() - f.born) / 600;
          const opacity = Math.max(0, 1 - age);
          return (
            <span
              key={f.id}
              style={{
                position: 'absolute',
                left: f.x - 2,
                top: f.y - 2,
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: 'var(--color-shuttle)',
                opacity
              }}
            />
          );
        })}
      </div>
      <motion.div
        aria-hidden="true"
        animate={smashing ? { scale: 1.4, rotate: 25 } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.12 }}
        style={{
          x: sx,
          y: sy,
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 9999
        }}
      >
        <svg width="20" height="20" viewBox="-10 -10 20 20">
          <circle r="6" fill="var(--color-shuttle)" stroke="var(--color-ink)" strokeWidth="1.2" />
          <line x1="-3" y1="-5" x2="-8" y2="-9" stroke="var(--color-ink)" strokeWidth="1" />
          <line x1="-3" y1="0" x2="-9" y2="0" stroke="var(--color-ink)" strokeWidth="1" />
          <line x1="-3" y1="5" x2="-8" y2="9" stroke="var(--color-ink)" strokeWidth="1" />
        </svg>
      </motion.div>
    </>
  );
}
