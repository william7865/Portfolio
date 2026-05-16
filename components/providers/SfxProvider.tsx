'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useSfx } from '@/lib/sfx';

type Ctx = ReturnType<typeof useSfx>;
const SfxContext = createContext<Ctx | null>(null);

export function SfxProvider({ children }: { children: ReactNode }) {
  const sfx = useSfx();
  return <SfxContext.Provider value={sfx}>{children}</SfxContext.Provider>;
}

export function useSfxContext() {
  const ctx = useContext(SfxContext);
  if (!ctx) throw new Error('useSfxContext must be used within SfxProvider');
  return ctx;
}
