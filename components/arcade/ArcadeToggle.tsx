'use client';
import { useTranslations } from 'next-intl';
import { useArcade } from './ArcadeProvider';

export function ArcadeToggle() {
  const { unlocked, mode, toggleMode, unlock } = useArcade();
  const t = useTranslations('footer');
  if (!unlocked) {
    return (
      <button onClick={unlock} className="hover:text-court-line text-muted">
        {t('toggleArcadeOff')} <span aria-hidden>🕹️</span>
      </button>
    );
  }
  return (
    <button
      onClick={toggleMode}
      className="hover:text-court-line"
      aria-pressed={mode === 'arcade'}
    >
      {t('toggleArcadeOn')}: <strong>{mode}</strong>
    </button>
  );
}
