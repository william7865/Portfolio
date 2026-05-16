'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  stamp: string;
};

/**
 * Cormorant Garamond italic button with a cinnabar seal that springs in on hover/focus.
 */
export function SealButton({ children, stamp, className = '', ...rest }: Props) {
  return (
    <button {...rest} className={`seal-button ${className}`}>
      <span>{children}</span>
      <span aria-hidden="true" className="stamp">{stamp}</span>
    </button>
  );
}
