import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ScoredSection } from '@/components/scoreboard/ScoredSection';
import cv from '@/content/data/cv.json';

export function Service() {
  const t = useTranslations('service');
  return (
    <ScoredSection
      id="service"
      className="min-h-[80vh] flex items-center px-6 md:px-16 py-20"
    >
      <div className="grid md:grid-cols-2 gap-12 items-center w-full max-w-6xl mx-auto">
        <div>
          <p className="font-mono text-xs tracking-widest text-court-line uppercase">{t('zone')}</p>
          <h1 className="font-display italic text-6xl md:text-8xl mt-4 leading-none">{cv.name}</h1>
          <p className="font-sans text-lg md:text-xl mt-6 max-w-md leading-relaxed">{t('tagline')}</p>
          <a
            href="#matchpoint"
            className="inline-block mt-8 px-6 py-3 bg-ink text-hall-floor font-mono text-sm hover:bg-court-line transition-colors"
          >
            {t('cta')} →
          </a>
        </div>
        <div className="relative aspect-square max-w-md mx-auto">
          <Image
            src="/images/profile.jpg"
            alt="Portrait de William Lin"
            fill
            className="object-cover grayscale-[20%]"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
    </ScoredSection>
  );
}
