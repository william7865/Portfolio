'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import skillsData from '@/content/data/skills.json';
import { Seal } from '@/components/motifs/Seal';
import { CalligraphyStroke } from '@/components/motifs/CalligraphyStroke';
import { Reveal } from '@/components/system/Reveal';

type Skill = {
  name: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'Tools';
  level: number;
  lastUsed: string;
  proofs: { type: string; ref: string; label: string }[];
};

const CATEGORY_HANZI: Record<Skill['category'], { glyph: string; label: string }> = {
  Frontend: { glyph: '面', label: 'visage' },
  Backend: { glyph: '骨', label: 'os' },
  Database: { glyph: '庫', label: 'réserve' },
  Tools: { glyph: '具', label: 'outil' }
};

/** Three stylized stroke patterns — varied by category. */
const STROKE_PATHS: Record<Skill['category'], string[]> = {
  Frontend: ['M 5 50 Q 30 12, 60 50 T 95 50'],
  Backend: ['M 10 80 L 90 80 M 50 80 L 50 20 M 30 35 L 70 35'],
  Database: ['M 12 30 Q 50 0, 88 30 M 12 50 Q 50 80, 88 50 M 12 70 Q 50 95, 88 70'],
  Tools: ['M 8 80 L 40 20 L 60 60 L 92 20']
};

export function Skills() {
  const t = useTranslations('skills');
  const skills = skillsData as Skill[];
  const [hovered, setHovered] = useState<string | null>(null);

  const grouped = skills.reduce<Record<Skill['category'], Skill[]>>(
    (acc, s) => {
      (acc[s.category] ||= []).push(s);
      return acc;
    },
    {} as Record<Skill['category'], Skill[]>
  );

  const order: Skill['category'][] = ['Frontend', 'Backend', 'Database', 'Tools'];

  return (
    <section
      aria-labelledby="skills-title"
      className="relative py-32 px-6 lg:px-10"
    >
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <div className="kicker mb-3">{t('kicker')}</div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 id="skills-title" className="display text-5xl md:text-6xl mb-3 text-[var(--color-ivory)]">
            <em>{t('title')}</em>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="lede italic opacity-70 max-w-md mb-20">{t('subtitle')}</p>
        </Reveal>

        <div className="space-y-24">
          {order.map((cat) => (
            <div key={cat} className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-x-12 gap-y-6">
              {/* Category column */}
              <div className="md:sticky md:top-32 self-start">
                <div
                  className="font-display-hanzi text-7xl text-[var(--color-gold-bright)] leading-none mb-2"
                  style={{ textShadow: '0 0 18px rgba(233,196,106,0.4)' }}
                >
                  {CATEGORY_HANZI[cat].glyph}
                </div>
                <div className="kicker-mono">{cat}</div>
                <div className="font-display italic text-[var(--color-gold)] opacity-70 mt-1">
                  {CATEGORY_HANZI[cat].label}
                </div>
              </div>

              {/* Skill list */}
              <ul className="divide-y divide-[var(--color-gold)]/15">
                {grouped[cat]?.map((s) => (
                  <li
                    key={s.name}
                    onMouseEnter={() => setHovered(s.name)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(s.name)}
                    onBlur={() => setHovered(null)}
                    className="group relative grid grid-cols-[80px_1fr_auto] items-center gap-6 py-5"
                  >
                    {/* Stroke */}
                    <div
                      className="opacity-80 group-hover:opacity-100 transition-opacity"
                      style={{ width: 70, height: 56 }}
                    >
                      <CalligraphyStroke
                        paths={STROKE_PATHS[cat]}
                        viewBox="0 0 100 100"
                        strokeWidth={2 + s.level * 0.6}
                        duration={1500 + s.level * 200}
                      />
                    </div>

                    {/* Name + proof */}
                    <div tabIndex={0} className="outline-none">
                      <div className="font-display text-2xl text-[var(--color-ivory)]">
                        {s.name}
                      </div>
                      <div className="kicker-mono opacity-50 mt-1">
                        ★ {s.level} / 5 · {s.lastUsed}
                      </div>
                    </div>

                    {/* Seal proof on hover */}
                    <div className="relative h-12 w-12 flex items-center justify-center">
                      <div
                        className="transition-all duration-300"
                        style={{
                          opacity: hovered === s.name ? 1 : 0,
                          transform:
                            hovered === s.name
                              ? 'rotate(-8deg) scale(1)'
                              : 'rotate(-8deg) scale(0)'
                        }}
                      >
                        <Seal glyph={s.proofs[0]?.label.slice(0, 2) ?? '證'} size={44} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
