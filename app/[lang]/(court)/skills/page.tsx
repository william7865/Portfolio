import { SkillCourt } from '@/components/skill-court/SkillCourt';

export default function SkillsPage() {
  return (
    <section className="px-6 md:px-16 py-24 max-w-6xl mx-auto">
      <p className="font-mono text-xs tracking-widest text-court-line uppercase">
        Court de compétences
      </p>
      <h1 className="font-display italic text-6xl mt-2">Skills</h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
        Hover une compétence pour voir le niveau, la dernière utilisation, et les preuves.
      </p>
      <div className="mt-12">
        <SkillCourt />
      </div>
    </section>
  );
}
