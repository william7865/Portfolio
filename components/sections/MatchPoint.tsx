import { useTranslations } from 'next-intl';
import { ScoredSection } from '@/components/scoreboard/ScoredSection';
import { ContactForm } from '@/components/contact/ContactForm';

export function MatchPoint() {
  const t = useTranslations('matchpoint');
  return (
    <ScoredSection id="matchpoint" className="px-6 md:px-16 py-24 max-w-4xl mx-auto">
      <p className="font-mono text-xs tracking-widest text-court-line uppercase">
        Match Point · {t('subtitle')}
      </p>
      <h2 className="font-display italic text-5xl md:text-6xl mt-2">{t('title')}</h2>
      <p className="mt-6 text-lg leading-relaxed max-w-2xl">{t('lead')}</p>
      <div className="mt-10">
        <ContactForm />
      </div>
    </ScoredSection>
  );
}
