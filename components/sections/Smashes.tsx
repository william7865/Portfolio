import { useTranslations } from 'next-intl';
import { ScoredSection } from '@/components/scoreboard/ScoredSection';
import { ProjectCard } from '@/components/projects/ProjectCard';
import projects from '@/content/data/projects.json';

export function Smashes() {
  const t = useTranslations('smashes');
  return (
    <ScoredSection id="smashes" className="px-6 md:px-16 py-24 max-w-6xl mx-auto">
      <p className="font-mono text-xs tracking-widest text-court-line uppercase">
        Smashes · {t('subtitle')}
      </p>
      <h2 className="font-display italic text-5xl md:text-6xl mt-2">{t('title')}</h2>
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </ScoredSection>
  );
}
