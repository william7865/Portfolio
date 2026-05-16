export type EvalContext = {
  caseStudiesOpened: Set<string>;
  konamiUnlocked: boolean;
  eggsFound: Set<string>;
  langSwitched: boolean;
  scoreReached21: boolean;
  sectionsVisitedInOneMinute: number;
};

export type Achievement = {
  id: string;
  category: 'case_studies' | 'exploration' | 'form';
  title: { fr: string; en: string };
  description: { fr: string; en: string };
  visibleIn: 'always' | 'arcade';
  condition: (ctx: EvalContext) => boolean;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_blood',
    category: 'case_studies',
    title: { fr: 'First Blood', en: 'First Blood' },
    description: { fr: 'Premier case study lu', en: 'First case study opened' },
    visibleIn: 'arcade',
    condition: (c) => c.caseStudiesOpened.size >= 1
  },
  {
    id: 'double_kill',
    category: 'case_studies',
    title: { fr: 'Double Kill', en: 'Double Kill' },
    description: { fr: 'Deux case studies lus', en: 'Two case studies' },
    visibleIn: 'arcade',
    condition: (c) => c.caseStudiesOpened.size >= 2
  },
  {
    id: 'triple_kill',
    category: 'case_studies',
    title: { fr: 'Triple Kill', en: 'Triple Kill' },
    description: { fr: 'Trois case studies lus', en: 'Three case studies' },
    visibleIn: 'arcade',
    condition: (c) => c.caseStudiesOpened.size >= 3
  },
  {
    id: 'quadrakill',
    category: 'case_studies',
    title: { fr: 'Quadrakill', en: 'Quadrakill' },
    description: { fr: 'Quatre case studies lus', en: 'Four case studies' },
    visibleIn: 'arcade',
    condition: (c) => c.caseStudiesOpened.size >= 4
  },
  {
    id: 'pentakill',
    category: 'case_studies',
    title: { fr: 'Pentakill', en: 'Pentakill' },
    description: { fr: 'Cinq case studies lus', en: 'Five case studies' },
    visibleIn: 'arcade',
    condition: (c) => c.caseStudiesOpened.size >= 5
  },
  {
    id: 'konami_master',
    category: 'exploration',
    title: { fr: 'Konami Master', en: 'Konami Master' },
    description: { fr: 'Code Konami complet', en: 'Konami code entered' },
    visibleIn: 'arcade',
    condition: (c) => c.konamiUnlocked
  },
  {
    id: 'set_won',
    category: 'exploration',
    title: { fr: 'Set Won', en: 'Set Won' },
    description: { fr: 'Score atteint 21', en: 'Score reached 21' },
    visibleIn: 'arcade',
    condition: (c) => c.scoreReached21
  },
  {
    id: 'polyglot',
    category: 'exploration',
    title: { fr: 'Polyglot', en: 'Polyglot' },
    description: { fr: 'Tu as switché FR ⇄ EN', en: 'You switched FR ⇄ EN' },
    visibleIn: 'arcade',
    condition: (c) => c.langSwitched
  },
  {
    id: 'speedrunner',
    category: 'exploration',
    title: { fr: 'Speedrunner', en: 'Speedrunner' },
    description: {
      fr: "Toutes sections en moins d'1 min",
      en: 'All sections under 1 min'
    },
    visibleIn: 'arcade',
    condition: (c) => c.sectionsVisitedInOneMinute >= 5
  },
  {
    id: 'match_point_sent',
    category: 'form',
    title: { fr: 'Match Point !', en: 'Match Point!' },
    description: { fr: 'Formulaire envoyé', en: 'Contact form sent' },
    visibleIn: 'always',
    condition: (c) => c.eggsFound.has('form_submitted')
  }
];

export function evaluateAchievements(
  ctx: EvalContext,
  already: Set<string>
): Set<string> {
  const newly = new Set<string>();
  for (const a of ACHIEVEMENTS) {
    if (already.has(a.id)) continue;
    if (a.condition(ctx)) newly.add(a.id);
  }
  return newly;
}
