'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'sfx-enabled';

type SoundKey = 'tick' | 'tap' | 'gong';

/**
 * Web Audio synthesized SFX system. No external files.
 *
 * - tick  : a soft drum tick (sine body + noise attack), ~150ms — for primary CTAs.
 * - tap   : a paper tap (bandpass noise burst), ~40ms — for light interactions.
 * - gong  : a distant gong (fundamental + harmonics + lowpass sweep), ~3s — for the easter egg.
 *
 * Default ON. Persisted in localStorage. AudioContext is lazy-initialized on
 * the first play() call, which must happen from a user gesture.
 */
export function useSfx() {
  const [enabled, setEnabled] = useState(true);
  const ctxRef = useRef<AudioContext | null>(null);

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

  const getCtx = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (!ctxRef.current) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      try {
        ctxRef.current = new AC();
      } catch {
        return null;
      }
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume().catch(() => {
        /* ignore */
      });
    }
    return ctxRef.current;
  }, []);

  const play = useCallback(
    (key: SoundKey, volume = 0.3) => {
      if (!enabled) return;
      const ctx = getCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      try {
        if (key === 'tick') {
          // Body: low-frequency sine with pitch envelope (drum punch)
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.exponentialRampToValueAtTime(58, now + 0.12);

          const oscGain = ctx.createGain();
          oscGain.gain.setValueAtTime(volume * 1.2, now);
          oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
          osc.connect(oscGain).connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.18);

          // Click: short filtered noise burst for attack snap
          const len = Math.floor(ctx.sampleRate * 0.04);
          const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          const decay = ctx.sampleRate * 0.012;
          for (let i = 0; i < len; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / decay);
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 900;
          const noiseGain = ctx.createGain();
          noiseGain.gain.value = volume * 0.4;
          noise.connect(filter).connect(noiseGain).connect(ctx.destination);
          noise.start(now);
        }

        if (key === 'tap') {
          // Bandpass noise burst — paper-like
          const len = Math.floor(ctx.sampleRate * 0.05);
          const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          const decay = ctx.sampleRate * 0.008;
          for (let i = 0; i < len; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / decay);
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 2400;
          filter.Q.value = 2.5;
          const gain = ctx.createGain();
          gain.gain.value = volume * 0.5;
          noise.connect(filter).connect(gain).connect(ctx.destination);
          noise.start(now);
        }

        if (key === 'gong') {
          // Layered sine partials + slow lowpass sweep + long exponential decay
          const partials = [
            { freq: 180, amp: 1.0 },
            { freq: 268, amp: 0.55 }, // perfect fifth-ish, slightly detuned
            { freq: 540, amp: 0.32 },
            { freq: 712, amp: 0.18 },
            { freq: 1080, amp: 0.1 }
          ];

          const masterGain = ctx.createGain();
          masterGain.gain.setValueAtTime(0, now);
          masterGain.gain.linearRampToValueAtTime(volume * 0.9, now + 0.05);
          masterGain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(2200, now);
          filter.frequency.exponentialRampToValueAtTime(280, now + 2.6);
          filter.Q.value = 1.2;

          masterGain.connect(filter).connect(ctx.destination);

          for (const p of partials) {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = p.freq + (Math.random() - 0.5) * 3;
            const g = ctx.createGain();
            g.gain.value = p.amp;
            osc.connect(g).connect(masterGain);
            osc.start(now);
            osc.stop(now + 3.2);
          }
        }
      } catch {
        /* ignore unsupported / suspended context */
      }
    },
    [enabled, getCtx]
  );

  return { enabled, toggle, play };
}
