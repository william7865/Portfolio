'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import projectsData from '@/content/data/projects.json';
import { GoldRoller } from '@/components/motifs/GoldRoller';
import { Seal } from '@/components/motifs/Seal';

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

export function Works() {
  const t = useTranslations('works');
  const locale = useLocale() as 'fr' | 'en';
  const projects = projectsData as Project[];
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  // Translate horizontally across panels; each panel = ~80vw. Leave a slight pause at start/end.
  const x = useTransform(scrollYProgress, [0.05, 0.95], ['0vw', `-${(projects.length) * 78}vw`]);

  return (
    <section
      aria-labelledby="works-title"
      ref={ref}
      className="relative"
      style={{ height: `${(projects.length + 1) * 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Header (sticky inside the sticky stage) */}
        <div className="absolute top-0 left-0 right-0 z-20 px-6 lg:px-10 pt-24 pointer-events-none">
          <div className="kicker mb-3">{t('kicker')}</div>
          <h2 id="works-title" className="display text-4xl md:text-5xl text-[var(--color-ivory)]">
            <em>{t('title')}</em>
          </h2>
          <p className="lede italic opacity-70 mt-2 max-w-md">{t('subtitle')}</p>
        </div>

        {/* Hint scroll */}
        <div className="absolute bottom-10 left-0 right-0 z-20 text-center kicker-mono opacity-50 pointer-events-none">
          ↓ {t('scrollHint')} →
        </div>

        {/* Handscroll stage */}
        <div className="absolute inset-0 flex items-center pl-[10vw]">
          <motion.div style={{ x }} className="flex items-stretch gap-0 will-change-transform h-[68vh]">
            <GoldRoller />
            {projects.map((p) => (
              <article
                key={p.slug}
                className="relative shrink-0 w-[72vw] md:w-[60vw] max-w-3xl flex flex-col p-10 md:p-14"
                style={{
                  background:
                    'radial-gradient(70% 50% at 30% 0%, rgba(120,60,20,0.18), transparent 60%), linear-gradient(180deg, #f5e6c8 0%, #e9d3a8 100%)',
                  boxShadow:
                    'inset 0 0 80px rgba(120,60,20,0.18), 0 12px 40px rgba(0,0,0,0.35)',
                  color: 'var(--color-vermillion)'
                }}
              >
                {/* Big hanzi background */}
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

                <div className="kicker-mono opacity-70 mb-6" style={{ color: 'var(--color-vermillion)' }}>
                  №{String(projects.indexOf(p) + 1).padStart(2, '0')} · {p.year}
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
                    className="font-display text-4xl md:text-5xl mt-2 mb-2"
                    style={{ color: 'var(--color-vermillion)' }}
                  >
                    {p.title}
                  </h3>
                  <p
                    className="font-display italic text-lg leading-relaxed mb-6 max-w-sm"
                    style={{ color: 'rgba(74,10,14,0.78)' }}
                  >
                    {p.tagline[locale]}
                  </p>

                  <div className="font-mono text-xs tracking-[0.18em] uppercase mb-6" style={{ color: 'rgba(74,10,14,0.6)' }}>
                    {p.role}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {p.tags.map((tag) => (
                      <Seal
                        key={tag}
                        glyph={tag.slice(0, 2)}
                        size={32}
                        rotate={(tag.length % 6) - 3}
                        className="!text-[10px]"
                        ariaLabel={tag}
                        style={{ fontSize: 10 }}
                      />
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
            ))}
            {/* End cartouche */}
            <article
              className="relative shrink-0 w-[40vw] md:w-[32vw] max-w-md flex flex-col items-center justify-center p-10"
              style={{
                background:
                  'radial-gradient(70% 50% at 30% 0%, rgba(120,60,20,0.18), transparent 60%), linear-gradient(180deg, #f5e6c8 0%, #e9d3a8 100%)',
                boxShadow:
                  'inset 0 0 80px rgba(120,60,20,0.22), 0 12px 40px rgba(0,0,0,0.35)',
                color: 'var(--color-vermillion)'
              }}
            >
              <div className="kicker-mono mb-4" style={{ color: 'var(--color-vermillion)' }}>
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
            <GoldRoller />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
