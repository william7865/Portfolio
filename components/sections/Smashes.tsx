'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ScoredSection } from '@/components/scoreboard/ScoredSection';
import { useScore } from '@/components/scoreboard/ScoreProvider';
import projects from '@/content/data/projects.json';

export function Smashes() {
  const t = useTranslations('smashes');
  const locale = useLocale() as 'fr' | 'en';
  const { emit } = useScore();

  return (
    <ScoredSection id="smashes" className="relative px-0 py-32">
      {/* Section header */}
      <div className="px-6 md:px-10 grid grid-cols-12 gap-6 mb-16">
        <div className="col-span-12 md:col-span-3 label-mono text-court self-end">
          03 — SMASHES
        </div>
        <div className="col-span-12 md:col-span-9">
          <h2 className="display-black-condensed text-mega text-ink">
            Selected<br />
            work<span className="text-court">.</span>
          </h2>
        </div>
      </div>

      <div className="rule-double mx-6 md:mx-10 mb-2"></div>

      {/* Full-bleed project rows */}
      <ul>
        {projects.map((p, i) => {
          const num = String(i + 1).padStart(2, '0');
          const href = `/${locale}/projects/${p.slug}`;
          return (
            <li key={p.slug}>
              <Link
                href={href}
                prefetch
                onClick={() => emit({ type: 'project_click', id: p.slug })}
                className="group block border-b border-ink/20 hover:bg-ink hover:text-paper transition-colors"
              >
                <div className="px-6 md:px-10 py-10 md:py-14 grid grid-cols-12 gap-6 items-center">
                  {/* Massive number */}
                  <div className="col-span-2 md:col-span-1">
                    <div className="display-black-condensed text-[clamp(3rem,8vw,7rem)] leading-none">
                      {num}
                    </div>
                  </div>

                  {/* Title + tagline */}
                  <div className="col-span-10 md:col-span-5">
                    <h3 className="display-black-condensed text-[clamp(2rem,5vw,4.5rem)] leading-[0.92]">
                      {p.title}
                    </h3>
                    <p className="editorial-italic text-lg md:text-xl mt-3 opacity-80">
                      {p.tagline[locale]}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="col-span-7 md:col-span-3 flex flex-wrap gap-2">
                    {p.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="label-mono px-2 py-1 border border-current">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Year + arrow */}
                  <div className="col-span-5 md:col-span-3 flex items-center justify-end gap-6">
                    <span className="label-mono tabular">{p.year}</span>
                    <span
                      aria-hidden
                      className="display-black-condensed text-5xl transition-transform group-hover:translate-x-2"
                    >
                      →
                    </span>
                  </div>
                </div>

                {/* Image strip — only on hover (desktop) */}
                <div className="hidden md:block overflow-hidden max-h-0 group-hover:max-h-[200px] transition-[max-height] duration-500">
                  <div className="relative h-[200px] w-full">
                    <Image
                      src={p.image}
                      alt={`${p.title} — capture`}
                      fill
                      sizes="100vw"
                      className="object-cover object-top opacity-90"
                    />
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </ScoredSection>
  );
}
