import { getTranslations } from 'next-intl/server';
import { MDXRemote } from 'next-mdx-remote/rsc';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { Seal } from '@/components/motifs/Seal';
import { CalligraphyStroke } from '@/components/motifs/CalligraphyStroke';
import { Reveal } from '@/components/system/Reveal';

async function readLatestNow() {
  const dir = path.join(process.cwd(), 'content/now');
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.mdx')).sort().reverse();
  const latest = files[0];
  if (!latest) return null;
  const raw = await fs.readFile(path.join(dir, latest), 'utf8');
  const { data, content } = matter(raw);
  return { date: data.date as string, slug: latest.replace(/\.mdx$/, ''), content };
}

const MONTH_HANZI = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];

export async function Now() {
  const t = await getTranslations('now');
  const entry = await readLatestNow();
  if (!entry) return null;

  const date = new Date(entry.date);
  const monthIdx = date.getMonth();
  const monthHanzi = MONTH_HANZI[monthIdx] ?? '';
  const year = date.getFullYear();
  const dateLabel = date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <section aria-labelledby="now-title" className="relative py-32 px-6 lg:px-10">
      <div className="max-w-2xl mx-auto">
        <Reveal>
          <div className="kicker mb-3">{t('kicker')}</div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 id="now-title" className="display text-5xl md:text-6xl mb-3 text-[var(--color-ivory)]">
            <em>{t('title')}</em>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="lede italic opacity-70 max-w-md mb-12">{t('subtitle')}</p>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="relative">
            {/* Decorative inked frame — corner strokes */}
            <span
              aria-hidden="true"
              className="absolute -top-2 -left-2 w-10 h-10 border-t-2 border-l-2 border-[var(--color-gold)]/70 pointer-events-none"
            />
            <span
              aria-hidden="true"
              className="absolute -top-2 -right-2 w-10 h-10 border-t-2 border-r-2 border-[var(--color-gold)]/70 pointer-events-none"
            />
            <span
              aria-hidden="true"
              className="absolute -bottom-2 -left-2 w-10 h-10 border-b-2 border-l-2 border-[var(--color-gold)]/70 pointer-events-none"
            />
            <span
              aria-hidden="true"
              className="absolute -bottom-2 -right-2 w-10 h-10 border-b-2 border-r-2 border-[var(--color-gold)]/70 pointer-events-none"
            />

            <div className="border border-[var(--color-gold)]/25 p-8 md:p-14 relative bg-[var(--color-vermillion-deep)]/40">
              {/* Date header — big monthHanzi block on the left */}
              <div className="flex items-start gap-6 mb-8 pb-6 border-b border-[var(--color-gold)]/20">
                <div
                  className="font-display-hanzi leading-none text-[var(--color-gold-bright)] shrink-0"
                  style={{
                    fontSize: 'clamp(3rem, 6vw, 4.5rem)',
                    textShadow: '0 0 18px rgba(233,196,106,0.5)'
                  }}
                >
                  {monthHanzi}
                </div>
                <div className="pt-2">
                  <div className="kicker-mono mb-1">{t('moonOf')}</div>
                  <div className="font-display italic text-2xl md:text-3xl text-[var(--color-ivory)]">
                    {dateLabel}
                  </div>
                  <div className="font-mono text-xs tracking-[0.22em] uppercase opacity-50 mt-1">
                    {year} · entry {entry.slug}
                  </div>
                </div>
              </div>

              {/* Inked decorative stroke */}
              <div aria-hidden="true" className="mb-6 -mx-2 opacity-80">
                <CalligraphyStroke
                  paths={['M 5 50 Q 30 14, 60 50 T 95 50']}
                  viewBox="0 0 100 60"
                  strokeWidth={2.4}
                  width={140}
                  height={40}
                  eager
                />
              </div>

              <article className="prose-tang">
                <MDXRemote source={entry.content} />
              </article>

              <div className="mt-12 flex items-center gap-4 pt-6 border-t border-[var(--color-gold)]/20">
                <Seal glyph="記" size={40} rotate={-5} />
                <span className="font-mono text-xs tracking-[0.22em] uppercase opacity-50">
                  {t('stamped')}
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
