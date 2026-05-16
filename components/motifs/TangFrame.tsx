import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  dragons?: boolean;
};

/**
 * Multi-layered Tang ornamental frame.
 * Used at the Final section. Optionally adds dragon glyphs at corners.
 */
export function TangFrame({ children, className = '', dragons = false }: Props) {
  return (
    <div className={`tang-frame ${className}`}>
      {dragons && (
        <>
          <span
            aria-hidden="true"
            className="font-display-hanzi absolute -top-3 left-1/2 -translate-x-[180%] text-3xl text-[var(--color-gold)] opacity-70"
            style={{ textShadow: '0 0 12px rgba(212,175,55,0.5)' }}
          >
            龍
          </span>
          <span
            aria-hidden="true"
            className="font-display-hanzi absolute -top-3 left-1/2 translate-x-[80%] text-3xl text-[var(--color-gold)] opacity-70 scale-x-[-1]"
            style={{ textShadow: '0 0 12px rgba(212,175,55,0.5)' }}
          >
            龍
          </span>
        </>
      )}
      {children}
    </div>
  );
}
