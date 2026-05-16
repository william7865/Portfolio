'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useScore } from './ScoreProvider';
import { MatchPointScene } from './MatchPointScene';

export function Scoreboard() {
  const t = useTranslations('score');
  const { state } = useScore();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (state.matchPoint) setShow(true);
  }, [state.matchPoint]);

  return (
    <>
      <div
        role="status"
        aria-live="polite"
        aria-label={t('ariaLive', { points: state.points })}
        className="fixed top-4 right-4 z-50 bg-ink text-hall-floor px-3 py-2 font-mono text-xs tracking-widest"
      >
        {t('label')} · {String(state.points).padStart(2, '0')} — 21
      </div>
      <MatchPointScene visible={show} onClose={() => setShow(false)} />
    </>
  );
}
