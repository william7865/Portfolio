'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import { createKonamiDetector } from '@/lib/konami';

const KEY = 'mp.arcadeUnlocked';

type Mode = 'pro' | 'arcade';
type Ctx = {
  unlocked: boolean;
  mode: Mode;
  toggleMode: () => void;
  unlock: () => void;
};

const ArcadeCtx = createContext<Ctx | null>(null);

export function ArcadeProvider({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => storage.get<boolean>(KEY, false));
  const [mode, setMode] = useState<Mode>(() =>
    storage.get<boolean>(KEY, false) ? 'arcade' : 'pro'
  );

  useEffect(() => {
    storage.set(KEY, unlocked);
  }, [unlocked]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const detector = createKonamiDetector(() => {
      setUnlocked(true);
      setMode('arcade');
    });
    const onKey = (e: KeyboardEvent) => detector.push(e.key);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.dataset.mode = mode;
    }
  }, [mode]);

  const toggleMode = () => setMode((m) => (m === 'pro' ? 'arcade' : 'pro'));
  const unlock = () => {
    setUnlocked(true);
    setMode('arcade');
  };

  return (
    <ArcadeCtx.Provider value={{ unlocked, mode, toggleMode, unlock }}>
      {children}
    </ArcadeCtx.Provider>
  );
}

export function useArcade(): Ctx {
  const ctx = useContext(ArcadeCtx);
  if (!ctx) throw new Error('useArcade outside provider');
  return ctx;
}
