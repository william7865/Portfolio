import { useTranslations } from 'next-intl';

type Skill = {
  name: string;
  level: number;
  lastUsed: string;
  proofs: { type: string; ref: string; label: string }[];
};

export function SkillPanel({ skill }: { skill: Skill | null }) {
  const t = useTranslations('skills');
  if (!skill) return null;
  return (
    <div
      className="absolute top-2 right-2 max-w-xs bg-ink text-hall-floor p-4 font-mono text-xs space-y-2"
      role="status"
      aria-live="polite"
    >
      <div className="font-display italic text-2xl">{skill.name}</div>
      <div>
        {t('level')} · {'★'.repeat(skill.level)}
        {'☆'.repeat(5 - skill.level)}
      </div>
      <div>
        {t('lastUsed')} · {skill.lastUsed}
      </div>
      <div className="pt-2 border-t border-hall-floor/20">
        {t('proofs')} :
        <ul className="list-disc list-inside">
          {skill.proofs.map((p) => (
            <li key={p.label}>{p.label}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
