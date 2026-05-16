'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  paths: string[];
  viewBox?: string;
  width?: number | string;
  height?: number | string;
  strokeWidth?: number;
  className?: string;
  duration?: number;
  /** Disable IntersectionObserver and reveal immediately. */
  eager?: boolean;
  ariaLabel?: string;
};

/**
 * SVG calligraphy stroke with reveal-on-scroll via IntersectionObserver.
 * Each path is drawn sequentially with stroke-dasharray.
 */
export function CalligraphyStroke({
  paths,
  viewBox = '0 0 100 100',
  width = '100%',
  height = '100%',
  strokeWidth = 3,
  className = '',
  duration = 2000,
  eager = false,
  ariaLabel
}: Props) {
  const ref = useRef<SVGSVGElement | null>(null);
  const [revealed, setRevealed] = useState(eager);

  useEffect(() => {
    if (eager || !ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setRevealed(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [eager]);

  return (
    <svg
      ref={ref}
      viewBox={viewBox}
      width={width}
      height={height}
      className={className}
      role={ariaLabel ? 'img' : 'presentation'}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : 'true'}
    >
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          className="stroke-path"
          strokeWidth={strokeWidth}
          data-revealed={revealed ? 'true' : 'false'}
          style={{
            ['--len' as string]: '600',
            animationDelay: `${i * 0.18}s`,
            animationDuration: `${duration}ms`
          }}
        />
      ))}
    </svg>
  );
}
