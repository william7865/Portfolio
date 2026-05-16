import { ProjectCard } from '@/components/projects/ProjectCard';
import projects from '@/content/data/projects.json';

export default function ProjectsListPage() {
  return (
    <section className="px-6 md:px-16 py-24 max-w-6xl mx-auto">
      <p className="font-mono text-xs tracking-widest text-court uppercase">Smashes</p>
      <h1 className="font-display italic text-6xl mt-2">Projets</h1>
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </section>
  );
}
