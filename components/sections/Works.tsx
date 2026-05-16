'use client';

import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import projectsData from '@/content/data/projects.json';
import { GoldRoller } from '@/components/motifs/GoldRoller';
import { Seal } from '@/components/motifs/Seal';
import { useIsMobile } from '@/lib/useIsMobile';

function TechChip({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center font-mono text-[10px] tracking-[0.18em] uppercase px-2.5 py-1 rounded-sm"
      style={{
        background: 'rgba(74,10,14,0.06)',
        border: '1px solid rgba(74,10,14,0.35)',
        color: 'rgba(74,10,14,0.85)'
      }}
    >
      {label}
    </span>
  );
}

type Project = {
  slug: string;
  hanzi: string;
  hanziLabel: string;
  title: string;
  tagline: { fr: string; en: string };
  year: number;
  role: string;
  tags: string[];
  repo: string | null;
  demo: string | null;
};

function ProjectPanel({
  p,
  index,
  locale
}: {
  p: Project;
  index: number;
  locale: 'fr' | 'en';
}) {
  return (
    <article
      className="relative shrink-0 w-[80vw] md:w-[60vw] max-w-3xl flex flex-col p-8 md:p-14"
      style={{
        background:
          'radial-gradient(70% 50% at 30% 0%, rgba(120,60,20,0.18), transparent 60%), linear-gradient(180deg, #f5e6c8 0%, #e9d3a8 100%)',
        boxShadow:
          'inset 0 0 80px rgba(120,60,20,0.18), 0 12px 40px rgba(0,0,0,0.35)',
        color: 'var(--color-vermillion)'
      }}
    >
      <div
        aria-hidden="true"
        className="font-display-hanzi pointer-events-none select-none absolute"
        style={{
          right: '-1rem',
          top: '-1rem',
          fontSize: 'clamp(8rem, 18vw, 16rem)',
          lineHeight: 1,
          color: 'rgba(74,10,14,0.10)'
        }}
      >
        {p.hanzi}
      </div>

      <div
        className="kicker-mono opacity-70 mb-6"
        style={{ color: 'var(--color-vermillion)' }}
      >
        №{String(index + 1).padStart(2, '0')} · {p.year}
      </div>

      <div className="relative z-10 max-w-md">
        <div className="flex items-end gap-3 mb-2">
          <span
            className="font-display-hanzi text-7xl leading-none"
            style={{ color: 'var(--color-vermillion)' }}
          >
            {p.hanzi}
          </span>
          <span
            className="font-mono text-[10px] tracking-[0.3em] uppercase pb-2"
            style={{ color: 'rgba(74,10,14,0.7)' }}
          >
            {p.hanziLabel}
          </span>
        </div>
        <h3
          className="font-display text-3xl md:text-5xl mt-2 mb-2"
          style={{ color: 'var(--color-vermillion)' }}
        >
          {p.title}
        </h3>
        <p
          className="font-display italic text-base md:text-lg leading-relaxed mb-6 max-w-sm"
          style={{ color: 'rgba(74,10,14,0.78)' }}
        >
          {p.tagline[locale]}
        </p>

        <div
          className="font-mono text-xs tracking-[0.18em] uppercase mb-6"
          style={{ color: 'rgba(74,10,14,0.6)' }}
        >
          {p.role}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {p.tags.map((tag) => (
            <TechChip key={tag} label={tag} />
          ))}
        </div>
      </div>

      {(p.repo || p.demo) && (
        <div className="relative z-10 mt-auto pt-6 flex gap-5 font-mono text-xs tracking-[0.18em] uppercase">
          {p.repo && (
            <a
              href={p.repo}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-vermillion)' }}
              className="hover:opacity-60 transition-opacity underline underline-offset-4 decoration-current/40"
            >
              GitHub →
            </a>
          )}
          {p.demo && (
            <a
              href={p.demo}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-vermillion)' }}
              className="hover:opacity-60 transition-opacity underline underline-offset-4 decoration-current/40"
            >
              Demo →
            </a>
          )}
        </div>
      )}
    </article>
  );
}

function EndPanel({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <article
      className="relative shrink-0 w-[60vw] md:w-[32vw] max-w-md flex flex-col items-center justify-center p-8 md:p-10"
      style={{
        background:
          'radial-gradient(70% 50% at 30% 0%, rgba(120,60,20,0.18), transparent 60%), linear-gradient(180deg, #f5e6c8 0%, #e9d3a8 100%)',
        boxShadow:
          'inset 0 0 80px rgba(120,60,20,0.22), 0 12px 40px rgba(0,0,0,0.35)',
        color: 'var(--color-vermillion)'
      }}
    >
      <div
        className="kicker-mono mb-4"
        style={{ color: 'var(--color-vermillion)' }}
      >
        {t('endNote')}
      </div>
      <Seal glyph="林" size={64} rotate={-5} />
      <div
        className="font-display italic text-xl mt-6"
        style={{ color: 'var(--color-vermillion)' }}
      >
        {t('byline')}
      </div>
    </article>
  );
}

export function Works() {
  const t = useTranslations('works');
  const locale = useLocale() as 'fr' | 'en';
  const projects = projectsData as Project[];
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <section
        aria-labelledby="works-title-mobile"
        className="relative py-24 px-6"
      >
        <div className="kicker mb-3">{t('kicker')}</div>
        <h2 id="works-title-mobile" className="display text-4xl text-[var(--color-ivory)] mb-2">
          <em>{t('title')}</em>
        </h2>
        <p className="lede italic opacity-70 mb-10 max-w-md">{t('subtitle')}</p>

        <div className="relative">
          {/* Horizontal roller as top cap on mobile */}
          <div
            aria-hidden="true"
            className="h-3 w-full mb-2 rounded-sm relative"
            style={{
              background:
                'linear-gradient(90deg, var(--color-gold) 0%, var(--color-gold-deep) 100%)',
              boxShadow: '0 0 12px rgba(212,175,55,0.4)'
            }}
          />
          <div className="flex flex-col gap-6">
            {projects.map((p, i) => (
              <ProjectPanel key={p.slug} p={p} index={i} locale={locale} />
            ))}
            <EndPanel t={t} />
          </div>
          <div
            aria-hidden="true"
            className="h-3 w-full mt-2 rounded-sm relative"
            style={{
              background:
                'linear-gradient(90deg, var(--color-gold) 0%, var(--color-gold-deep) 100%)',
              boxShadow: '0 0 12px rgba(212,175,55,0.4)'
            }}
          />
        </div>
      </section>
    );
  }

  return <WorksHandscroll projects={projects} t={t} locale={locale} />;
}

function WorksHandscroll({
  projects,
  t,
  locale
}: {
  projects: Project[];
  t: ReturnType<typeof useTranslations>;
  locale: 'fr' | 'en';
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0.05, 0.95], ['0vw', `-${projects.length * 78}vw`]);

  // Keyboard nav: ArrowRight/ArrowLeft = jump one panel (= one viewport-height
  // of vertical scroll, since the handscroll is bound to scrollYProgress)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!ref.current) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;

      const rect = ref.current.getBoundingClientRect();
      const inView = rect.top <= 0 && rect.bottom >= window.innerHeight;
      if (!inView) return;

      e.preventDefault();
      const step = window.innerHeight;
      window.scrollBy({ top: e.key === 'ArrowRight' ? step : -step, behavior: 'smooth' });
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <section
      aria-labelledby="works-title"
      ref={ref}
      className="relative"
      style={{ height: `${(projects.length + 1) * 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute top-0 left-0 right-0 z-20 px-6 lg:px-10 pt-24 pointer-events-none">
          <div className="kicker mb-3">{t('kicker')}</div>
          <h2 id="works-title" className="display text-4xl md:text-5xl text-[var(--color-ivory)]">
            <em>{t('title')}</em>
          </h2>
          <p className="lede italic opacity-70 mt-2 max-w-md">{t('subtitle')}</p>
        </div>

        <div className="absolute bottom-10 left-0 right-0 z-20 text-center kicker-mono opacity-50 pointer-events-none">
          ↓ {t('scrollHint')} →
          <span className="ml-2 opacity-50 hidden md:inline">· ← → keys</span>
        </div>

        <div className="absolute inset-0 flex items-center pl-[10vw]">
          <motion.div
            style={{ x }}
            className="flex items-stretch gap-0 will-change-transform h-[68vh]"
          >
            <GoldRoller />
            {projects.map((p, i) => (
              <ProjectPanel key={p.slug} p={p} index={i} locale={locale} />
            ))}
            <EndPanel t={t} />
            <GoldRoller />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
