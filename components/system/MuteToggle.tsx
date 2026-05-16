'use client';

import { useSfxContext } from '@/components/providers/SfxProvider';
import { useTranslations } from 'next-intl';

export function MuteToggle() {
  const { enabled, toggle } = useSfxContext();
  const t = useTranslations();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={enabled ? t('mute.off') : t('mute.on')}
      title={enabled ? t('mute.off') : t('mute.on')}
      className="group relative w-9 h-9 grid place-items-center text-[var(--color-gold)] hover:text-[var(--color-gold-bright)] transition-colors"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Stylized bell — small Tang temple bell silhouette */}
        <path d="M12 3a4 4 0 0 0-4 4v3l-2 5h12l-2-5V7a4 4 0 0 0-4-4Z" />
        <path d="M10 18a2 2 0 0 0 4 0" />
        {!enabled && <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="1.8" />}
      </svg>
    </button>
  );
}
