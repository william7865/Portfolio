'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'sfx-enabled';

type SoundKey = 'tick' | 'tap' | 'gong';

const SOUNDS: Record<SoundKey, string> = {
  tick: '/audio/drum-tick.mp3',
  tap: '/audio/paper-tap.mp3',
  gong: '/audio/distant-gong.mp3'
};

/**
 * Lightweight sound system. Default ON. Persists in localStorage.
 * Audio assets are optional — silently fails if missing.
 */
export function useSfx() {
  const [enabled, setEnabled] = useState(true);
  const cache = useRef<Map<SoundKey, HTMLAudioElement>>(new Map());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === '0') setEnabled(false);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setEnabled((v) => {
      const next = !v;
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const play = useCallback(
    (key: SoundKey, volume = 0.3) => {
      if (!enabled) return;
      try {
        let audio = cache.current.get(key);
        if (!audio) {
          audio = new Audio(SOUNDS[key]);
          audio.preload = 'auto';
          cache.current.set(key, audio);
        }
        audio.currentTime = 0;
        audio.volume = volume;
        audio.play().catch(() => {
          /* autoplay blocked or asset missing — silent */
        });
      } catch {
        /* ignore */
      }
    },
    [enabled]
  );

  return { enabled, toggle, play };
}
