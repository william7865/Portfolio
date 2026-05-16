import { compileMDX } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';
import { readProjectMdx, getProjectSlugs } from '@/lib/mdx';
import { locales } from '@/lib/i18n';
import { CaseStudyTracker } from '@/components/projects/CaseStudyTracker';

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return locales.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

export default async function CaseStudyPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const { frontmatter, content } = await readProjectMdx(slug);
    const { content: rendered } = await compileMDX({ source: content });
    return (
      <article className="px-6 md:px-16 py-24 max-w-3xl mx-auto prose-like">
        <CaseStudyTracker slug={slug} />
        <p className="font-mono text-xs tracking-widest text-court-line uppercase">
          Replay analysis
        </p>
        <h1 className="font-display italic text-5xl md:text-6xl mt-2">
          {String(frontmatter.title ?? slug)}
        </h1>
        <div className="mt-2 font-mono text-xs text-muted">
          {String(frontmatter.year)} · {String(frontmatter.role)}
          {frontmatter.duration ? ` · ${String(frontmatter.duration)}` : ''}
        </div>
        <div className="mt-10 space-y-6 leading-relaxed text-base">{rendered}</div>
      </article>
    );
  } catch {
    notFound();
  }
}
