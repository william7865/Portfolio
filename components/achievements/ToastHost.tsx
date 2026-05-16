'use client';
import { useEffect } from 'react';
import { useAchievements } from './AchievementsProvider';
import { useArcade } from '@/components/arcade/ArcadeProvider';

export function ToastHost() {
  const { toasts, dismiss } = useAchievements();
  const { mode } = useArcade();

  useEffect(() => {
    const timers = toasts.map((t) => window.setTimeout(() => dismiss(t.id), 4000));
    return () => timers.forEach(window.clearTimeout);
  }, [toasts, dismiss]);

  if (mode !== 'arcade') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          aria-live="polite"
          className="bg-ink text-paper font-mono text-xs px-4 py-3 border-l-2 border-shuttle pointer-events-auto max-w-xs"
        >
          <div className="text-shuttle">🏆 {t.title}</div>
          <div className="text-paper/80 mt-0.5">{t.description}</div>
        </div>
      ))}
    </div>
  );
}
