'use client';

import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { motion, useScroll, useTransform, type MotionStyle } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import projectsData from '@/content/data/projects.json';
import { Seal } from '@/components/motifs/Seal';
import { SceneVideo } from '@/components/motifs/SceneVideo';
import { useScrollRange } from '@/lib/useScrollRange';

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

/** No paper of its own: the text sits on the filmed handscroll. */
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
      className="sheet-panel sheet-scale"
      style={{ color: 'var(--color-vermillion)' }}
    >
      <div
        aria-hidden="true"
        className="font-display-hanzi pointer-events-none select-none absolute"
        style={{
          right: '-1rem',
          top: '-1rem',
          fontSize: 'clamp(8rem, 34vh, 16rem)',
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
        <div className={`relative z-10 mt-2 pt-6 flex gap-5 font-mono text-xs tracking-[0.18em] uppercase`}>
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
      className="relative flex flex-col items-center justify-center sheet-scale"
      style={{ color: 'var(--color-vermillion)' }}
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
  // Beats on scrollYProgress:
  //   0.02 – 0.20  the filmed scroll unrolls across the screen
  //   0.20 – 0.27  the first project is inked onto the sheet
  //   0.30 – 0.95  the sheet slides one project at a time, pausing on each
  const unroll = useScrollRange(scrollYProgress, [0.02, 0.2], [0, 1]);
  const headerOpacity = useScrollRange(scrollYProgress, [0.04, 0.14], [1, 0]);
  const inkOpacity = useScrollRange(scrollYProgress, [0.2, 0.27], [0, 1]);

  const pages = projects.length + 1;
  const { stops, steps } = useMemo(() => {
    const span = (0.95 - 0.3) / (pages - 1);
    const stops: number[] = [];
    const steps: number[] = [];
    for (let k = 0; k < pages - 1; k++) {
      // Hold on page k for the first 45% of its span, then slide to k + 1.
      stops.push(0.3 + (k + 0.45) * span, 0.3 + (k + 1) * span);
      steps.push(k, k + 1);
    }
    return { stops, steps };
  }, [pages]);
  // The page the scroll is on, as a number. The stylesheet turns it into a
  // sideways slide, or a downward one when the frame is turned (tall screens).
  const shift = useTransform(scrollYProgress, stops, steps);

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
      id="projets"
      aria-labelledby="works-title"
      ref={ref}
      className="relative"
      style={{ height: `${(projects.length + 2) * 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="scene-fade-y absolute inset-0">
          <div className="scene-stage" style={{ '--pages': pages } as CSSProperties}>
            {/* scroll.jpg is the open sheet (reduced motion); the clip starts rolled up */}
            <div className="scene-film">
              <SceneVideo scene="scroll" poster="scroll-start" progress={unroll} />
            </div>

            {/* Projects, written on the unrolled sheet */}
            <motion.div style={{ opacity: inkOpacity }} className="scene-sheet">
              <motion.div className="scene-track" style={{ '--shift': shift } as MotionStyle}>
                {projects.map((p, i) => (
                  <div key={p.slug} className="scene-page">
                    <ProjectPanel p={p} index={i} locale={locale} />
                  </div>
                ))}
                <div className="scene-page">
                  <EndPanel t={t} />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Sits on the empty lacquer beside the rolled-up scroll */}
        <motion.div
          style={{ opacity: headerOpacity }}
          className="works-head absolute z-20 px-6 lg:px-10 pointer-events-none"
        >
          <div className="kicker mb-3">{t('kicker')}</div>
          <h2 id="works-title" className="display text-4xl md:text-5xl text-[var(--color-ivory)]">
            <em>{t('title')}</em>
          </h2>
          <p className="lede italic opacity-70 mt-2 max-w-md">{t('subtitle')}</p>
        </motion.div>

        {/* Upright screens: one line, left of the back-to-top button */}
        <div className="absolute bottom-6 left-0 right-0 z-20 px-16 text-center portrait:pl-6 portrait:pr-20 portrait:text-left kicker-mono opacity-50 pointer-events-none">
          ↓ {t('scrollHint')} →
          <span className="ml-2 opacity-50 hidden md:inline">· ← → keys</span>
        </div>
      </div>
    </section>
  );
}
