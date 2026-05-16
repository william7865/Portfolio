import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ScoredSection } from '@/components/scoreboard/ScoredSection';
import cv from '@/content/data/cv.json';

// Letters of WILLIAM with per-letter stagger
const NAME = 'WILLIAM';
const NAME_2 = 'LIN';

const STACK = [
  'Next.js 15',
  'TypeScript',
  'React 19',
  'PostgreSQL',
  'Docker',
  'Vue.js',
  'PHP / Symfony',
  '.NET / C#',
  'Tailwind v4',
  'GitHub Actions',
  'Figma',
  'MongoDB'
];

export function Service() {
  const t = useTranslations('service');

  return (
    <ScoredSection id="service" className="relative min-h-screen pt-24 md:pt-32 overflow-hidden">
      {/* Sticky meta · top-left */}
      <div className="absolute top-6 left-6 md:left-10 z-10 label-mono text-ink-soft">
        <div>WL · 01 — SERVE</div>
        <div className="mt-1 text-court">EFREI · S6 · 2026</div>
      </div>

      {/* Sticky meta · top-right (under nav) */}
      <div className="absolute top-6 right-6 md:right-10 z-10 label-mono text-ink-soft text-right">
        <div>PARIS · FR / EN</div>
        <div className="mt-1 tabular">48°54′N · 2°20′E</div>
      </div>

      {/* Massive headline — overflows the viewport */}
      <div className="relative pl-4 md:pl-10 mt-8 md:mt-16 letter-reveal">
        <h1 className="display-black-condensed text-hero text-ink select-none">
          {[...NAME].map((c, i) => (
            <span key={i} style={{ animationDelay: `${i * 60}ms` }}>{c}</span>
          ))}
        </h1>
        <h1 className="display-black-condensed text-hero text-court -mt-[0.08em] select-none">
          {[...NAME_2].map((c, i) => (
            <span key={i} style={{ animationDelay: `${(NAME.length + i) * 60}ms` }}>{c}</span>
          ))}
          <span className="editorial-italic font-light text-ink ml-4" style={{ animationDelay: `${(NAME.length + NAME_2.length) * 60}ms` }}>
            <span style={{ animationDelay: `${(NAME.length + NAME_2.length) * 60}ms` }}>·</span>
          </span>
        </h1>
      </div>

      {/* Asymmetric meta row */}
      <div className="relative px-6 md:px-10 mt-12 md:mt-20 grid grid-cols-12 gap-6 items-end">
        {/* Portrait */}
        <div className="col-span-12 md:col-span-5 lg:col-span-4 order-2 md:order-1">
          <div className="relative aspect-[4/5] bg-net">
            <Image
              src="/images/profile.jpg"
              alt="William Lin"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover duotone-court"
            />
            {/* Tape label corner */}
            <div className="absolute -top-3 -left-3 bg-shuttle px-3 py-1.5 label-mono text-ink rotate-[-3deg] shadow-[3px_3px_0_var(--color-ink)]">
              PORTRAIT · 2026
            </div>
            <div className="absolute -bottom-3 right-4 bg-paper border-2 border-ink px-3 py-1 label-mono">
              EFREI · BAD
            </div>
          </div>
        </div>

        {/* Tagline + CTA */}
        <div className="col-span-12 md:col-span-7 lg:col-span-7 lg:col-start-6 order-1 md:order-2">
          <p className="editorial-italic text-2xl md:text-4xl lg:text-5xl text-ink leading-[1.08] max-w-2xl">
            {t('tagline')}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#matchpoint"
              className="magnetic group inline-flex items-center gap-3 bg-ink text-paper pl-6 pr-5 py-4 label-mono hover:bg-court transition-colors"
            >
              <span>{t('cta')}</span>
              <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </a>
            <a
              href="/CV.pdf"
              target="_blank"
              rel="noopener"
              className="magnetic label-mono underline decoration-2 underline-offset-[6px] hover:text-court"
            >
              CV.pdf ↗
            </a>
          </div>
        </div>
      </div>

      {/* Marquee tech stack */}
      <div className="mt-16 md:mt-24 rule-thick overflow-hidden">
        <div className="marquee-track py-5 label-mono text-ink">
          {[...STACK, ...STACK].map((s, i) => (
            <span key={i} className="px-6 inline-flex items-center gap-6 whitespace-nowrap">
              {s}
              <span aria-hidden className="text-court">✕</span>
            </span>
          ))}
        </div>
      </div>
    </ScoredSection>
  );
}
