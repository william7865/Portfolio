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
  const sx = useSpring(x, { stiffness: 400, damping: 32, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 400, damping: 32, mass: 0.4 });
  const lastSpawn = useRef(0);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

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
      const prev = lastPos.current;
      const dist = prev ? Math.hypot(e.clientX - prev.x, e.clientY - prev.y) : 0;
      if (now - lastSpawn.current > 28 && dist > 6) {
        lastSpawn.current = now;
        setTrail((t) => spawnFeather(t, e.clientX, e.clientY, now));
      }
      lastPos.current = { x: e.clientX, y: e.clientY };
    };
    const onClick = () => {
      setSmashing(true);
      window.setTimeout(() => setSmashing(false), 140);
    };
    const tick = window.setInterval(
      () => setTrail((t) => pruneFeathers(t, performance.now(), 700)),
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
      {/* Chalk-dash trail */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-[9998]">
        {trail.map((f, idx) => {
          const age = (performance.now() - f.born) / 700;
          const opacity = Math.max(0, 1 - age);
          const isDash = idx % 2 === 0;
          return (
            <span
              key={f.id}
              style={{
                position: 'absolute',
                left: f.x - (isDash ? 6 : 1.5),
                top: f.y - (isDash ? 1 : 1.5),
                width: isDash ? 12 : 3,
                height: isDash ? 2 : 3,
                background: 'var(--color-ink)',
                opacity: opacity * 0.55,
                transform: `rotate(${(f.id * 13) % 30 - 15}deg)`
              }}
            />
          );
        })}
      </div>

      {/* Shuttle */}
      <motion.div
        aria-hidden="true"
        animate={
          smashing
            ? { scale: 1.6, rotate: 35 }
            : { scale: 1, rotate: 0 }
        }
        transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
        style={{
          x: sx,
          y: sy,
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 9999,
          translateX: '-50%',
          translateY: '-50%'
        }}
      >
        <svg width="28" height="28" viewBox="-14 -14 28 28">
          {/* Cork base */}
          <circle r="7" fill="var(--color-shuttle)" stroke="var(--color-ink)" strokeWidth="1.5" />
          {/* Feathers — splayed cone */}
          <g stroke="var(--color-ink)" strokeWidth="1" strokeLinecap="round">
            <line x1="-4" y1="-6" x2="-12" y2="-12" />
            <line x1="-5" y1="-2" x2="-14" y2="-4" />
            <line x1="-5" y1="2" x2="-14" y2="4" />
            <line x1="-4" y1="6" x2="-12" y2="12" />
          </g>
        </svg>
      </motion.div>

      {/* Smash burst (chalk explosion) */}
      {smashing && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0.7, scale: 0.4 }}
          animate={{ opacity: 0, scale: 1.6 }}
          transition={{ duration: 0.35 }}
          style={{
            x: sx,
            y: sy,
            position: 'fixed',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            zIndex: 9999,
            translateX: '-50%',
            translateY: '-50%'
          }}
        >
          <svg width="60" height="60" viewBox="-30 -30 60 60">
            <g stroke="var(--color-court)" strokeWidth="1.5" strokeLinecap="round" fill="none">
              <line x1="0" y1="-10" x2="0" y2="-20" />
              <line x1="10" y1="0" x2="20" y2="0" />
              <line x1="0" y1="10" x2="0" y2="20" />
              <line x1="-10" y1="0" x2="-20" y2="0" />
              <line x1="7" y1="-7" x2="14" y2="-14" />
              <line x1="7" y1="7" x2="14" y2="14" />
              <line x1="-7" y1="7" x2="-14" y2="14" />
              <line x1="-7" y1="-7" x2="-14" y2="-14" />
            </g>
          </svg>
        </motion.div>
      )}
    </>
  );
}
