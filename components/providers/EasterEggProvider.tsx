'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSfxContext } from './SfxProvider';

const SEQUENCE = 'tang';
const STORAGE_KEY = 'master-scroll-unlocked';

type EasterEggCtx = {
  unlocked: boolean;
  /** Increment seal click counter (3 within 2s unlocks). */
  sealClick: () => void;
};

const Ctx = createContext<EasterEggCtx | null>(null);

export function EasterEggProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || 'fr';
  const { play } = useSfxContext();
  const [unlocked, setUnlocked] = useState(false);
  const buffer = useRef('');
  const sealCount = useRef(0);
  const sealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') setUnlocked(true);
    } catch {
      /* ignore */
    }
  }, []);

  const unlock = useCallback(() => {
    setUnlocked(true);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
    play('gong', 0.4);
    router.push(`/${lang}/master-scroll`);
  }, [router, lang, play]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ignore when typing in inputs
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key.length !== 1) return;
      buffer.current = (buffer.current + e.key.toLowerCase()).slice(-SEQUENCE.length);
      if (buffer.current === SEQUENCE) {
        buffer.current = '';
        unlock();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [unlock]);

  const sealClick = useCallback(() => {
    sealCount.current += 1;
    if (sealTimer.current) clearTimeout(sealTimer.current);
    sealTimer.current = setTimeout(() => {
      sealCount.current = 0;
    }, 2000);
    if (sealCount.current >= 3) {
      sealCount.current = 0;
      if (sealTimer.current) clearTimeout(sealTimer.current);
      unlock();
    } else {
      // Tactile feedback on each non-unlock click
      play('tap', 0.35);
    }
  }, [unlock, play]);

  return <Ctx.Provider value={{ unlocked, sealClick }}>{children}</Ctx.Provider>;
}

export function useEasterEgg() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useEasterEgg must be used within EasterEggProvider');
  return ctx;
}
