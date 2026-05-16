'use client';
import { useLocale, useTranslations } from 'next-intl';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { useAchievements } from '@/components/achievements/AchievementsProvider';

export default function AchievementsPage() {
  const { unlocked } = useAchievements();
  const locale = useLocale() as 'fr' | 'en';
  const t = useTranslations('arcade');
  return (
    <section className="px-6 md:px-16 py-24 max-w-3xl mx-auto">
      <p className="font-mono text-xs tracking-widest text-court uppercase">
        {t('subtitle')}
      </p>
      <h1 className="font-display italic text-6xl mt-2">{t('achievementsTitle')}</h1>
      <ul className="mt-10 space-y-3">
        {ACHIEVEMENTS.map((a) => {
          const got = unlocked.has(a.id);
          return (
            <li
              key={a.id}
              className={`flex justify-between items-center border-b border-ink/10 pb-3 ${
                got ? '' : 'opacity-40'
              }`}
            >
              <div>
                <div className="font-display italic text-2xl">{a.title[locale]}</div>
                <div className="font-mono text-xs text-muted">{a.description[locale]}</div>
              </div>
              <span className="font-mono text-xs">
                {got ? t('unlocked') : t('locked')}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
