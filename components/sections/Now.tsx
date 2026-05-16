import { getTranslations } from 'next-intl/server';
import { MDXRemote } from 'next-mdx-remote/rsc';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { Seal } from '@/components/motifs/Seal';

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
        <div className="kicker mb-3">{t('kicker')}</div>
        <h2 id="now-title" className="display text-5xl md:text-6xl mb-3 text-[var(--color-ivory)]">
          <em>{t('title')}</em>
        </h2>
        <p className="lede italic opacity-70 max-w-md mb-12">{t('subtitle')}</p>

        <div className="border border-[var(--color-gold)]/25 p-8 md:p-12 relative bg-[var(--color-vermillion-deep)]/35">
          <div className="absolute -top-3 left-8 px-3 bg-[var(--color-vermillion)] kicker-mono">
            {year} · {monthHanzi}月 · {dateLabel}
          </div>

          <article className="prose-tang">
            <MDXRemote source={entry.content} />
          </article>

          <div className="mt-10 flex items-center gap-4 pt-6 border-t border-[var(--color-gold)]/15">
            <Seal glyph="記" size={36} rotate={-5} />
            <span className="font-mono text-xs tracking-[0.22em] uppercase opacity-50">
              {t('stamped')} · {entry.slug}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
