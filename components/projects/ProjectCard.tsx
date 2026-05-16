'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useScore } from '@/components/scoreboard/ScoreProvider';

type Project = {
  slug: string;
  title: string;
  tagline: { fr: string; en: string };
  year: number;
  role: string;
  tags: string[];
  image: string;
  repo: string | null;
};

export function ProjectCard({ project }: { project: Project }) {
  const locale = useLocale() as 'fr' | 'en';
  const t = useTranslations('smashes');
  const { emit } = useScore();

  const href = `/${locale}/projects/${project.slug}`;

  return (
    <article className="border border-ink/15 bg-hall-floor hover:bg-ink/[.02] transition-colors">
      <Link href={href} prefetch onClick={() => emit({ type: 'project_click', id: project.slug })}>
        <div className="relative aspect-[16/10] bg-muted/10">
          <Image
            src={project.image}
            alt={`${project.title} — capture d'écran`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      </Link>
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-baseline">
          <h3 className="font-display italic text-2xl">{project.title}</h3>
          <span className="font-mono text-xs text-muted">
            {project.year} · {project.role}
          </span>
        </div>
        <p className="text-sm leading-relaxed">{project.tagline[locale]}</p>
        <div className="flex flex-wrap gap-1">
          {project.tags.map((tag) => (
            <span key={tag} className="font-mono text-[10px] px-2 py-0.5 border border-ink/30">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex gap-3 pt-2">
          <Link
            href={href}
            onClick={() => emit({ type: 'project_click', id: project.slug })}
            className="font-mono text-xs text-court-line hover:underline"
          >
            → {t('viewCase')}
          </Link>
          {project.repo && (
            <a
              href={project.repo}
              target="_blank"
              rel="noopener"
              className="font-mono text-xs text-muted hover:text-ink hover:underline"
            >
              → {t('code')}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
