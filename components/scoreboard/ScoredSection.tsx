'use client';
import { useEffect, useRef } from 'react';
import { useScore } from './ScoreProvider';

type Props = { id: string; children: React.ReactNode; className?: string };

export function ScoredSection({ id, children, className }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { emit } = useScore();
  const fired = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || fired.current) return;
    let timer: number | undefined;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.intersectionRatio >= 0.7 && !fired.current) {
          if (timer === undefined) {
            timer = window.setTimeout(() => {
              if (!fired.current) {
                fired.current = true;
                emit({ type: 'section_read', id });
              }
            }, 2000);
          }
        } else if (timer !== undefined) {
          window.clearTimeout(timer);
          timer = undefined;
        }
      },
      { threshold: [0.7] }
    );
    obs.observe(node);
    return () => {
      obs.disconnect();
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [id, emit]);

  return (
    <section ref={ref} id={id} className={className}>
      {children}
    </section>
  );
}
