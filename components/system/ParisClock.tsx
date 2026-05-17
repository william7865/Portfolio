'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

/**
 * 12 traditional Chinese hours (shichen). Each spans 2 hours;
 * the Rat hour (zi) wraps midnight (23h–01h).
 */
const SHICHEN: { han: string; key: HourKey }[] = [
  { han: '子', key: 'rat' },     // 23h-01h
  { han: '丑', key: 'ox' },      // 01h-03h
  { han: '寅', key: 'tiger' },   // 03h-05h
  { han: '卯', key: 'rabbit' },  // 05h-07h
  { han: '辰', key: 'dragon' },  // 07h-09h
  { han: '巳', key: 'snake' },   // 09h-11h
  { han: '午', key: 'horse' },   // 11h-13h
  { han: '未', key: 'goat' },    // 13h-15h
  { han: '申', key: 'monkey' },  // 15h-17h
  { han: '酉', key: 'rooster' }, // 17h-19h
  { han: '戌', key: 'dog' },     // 19h-21h
  { han: '亥', key: 'pig' }      // 21h-23h
];

type HourKey =
  | 'rat' | 'ox' | 'tiger' | 'rabbit' | 'dragon' | 'snake'
  | 'horse' | 'goat' | 'monkey' | 'rooster' | 'dog' | 'pig';

function getParisParts() {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Paris',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  const parts = fmt.formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
  const m = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
  const idx = Math.floor(((h + 1) % 24) / 2);
  const slot = SHICHEN[idx]!;
  return {
    time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
    han: slot.han,
    key: slot.key
  };
}

export function ParisClock() {
  const t = useTranslations('now');
  const [parts, setParts] = useState<{ time: string; han: string; key: HourKey } | null>(null);

  useEffect(() => {
    setParts(getParisParts());
    const id = window.setInterval(() => setParts(getParisParts()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  if (!parts) {
    // SSR placeholder — avoid hydration mismatch on time
    return <div className="paris-clock" aria-hidden="true" />;
  }

  return (
    <div className="paris-clock" aria-live="off">
      <div className="pc-row">
        <span className="pc-dot" />
        <span>{t('nowParis')}</span>
      </div>
      <div className="pc-row" style={{ marginTop: 4 }}>
        <span className="pc-time">{parts.time}</span>
        <span className="pc-han">{parts.han}</span>
        <span className="pc-animal">{t(`hour.${parts.key}`)}</span>
      </div>
    </div>
  );
}
