'use client';
import { useState } from 'react';
import skillsData from '@/content/data/skills.json';
import { getPositions } from './skill-positions';
import { COURT } from '@/components/court/court-zones';
import { useScore } from '@/components/scoreboard/ScoreProvider';
import { SkillPanel } from './SkillPanel';

type Skill = (typeof skillsData)[number];
const CATEGORIES = ['Frontend', 'Backend', 'Database', 'Tools'] as const;

export function SkillCourt() {
  const [active, setActive] = useState<Skill | null>(null);
  const { emit } = useScore();

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${COURT.vbWidth} ${COURT.vbHeight}`} className="w-full h-auto">
        <rect
          x="0"
          y="0"
          width={COURT.vbWidth}
          height={COURT.vbHeight}
          fill="none"
          stroke="var(--color-court-line)"
          strokeWidth="3"
        />
        <line
          x1={COURT.net}
          y1="0"
          x2={COURT.net}
          y2={COURT.vbHeight}
          stroke="var(--color-net-green)"
          strokeWidth="4"
          strokeDasharray="6 8"
        />
        {CATEGORIES.map((cat) => {
          const list = skillsData.filter((s) => s.category === cat);
          const positions = getPositions(cat, list.length);
          return list.map((s, i) => {
            const p = positions[i];
            if (!p) return null;
            return (
              <g
                key={s.name}
                transform={`translate(${p.x},${p.y})`}
                onMouseEnter={() => {
                  setActive(s);
                  emit({ type: 'skill_inspect', name: s.name });
                }}
                onMouseLeave={() => setActive(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle r="34" fill="var(--color-shuttle)" stroke="var(--color-ink)" strokeWidth="2" />
                <text
                  textAnchor="middle"
                  dy="5"
                  fontFamily="var(--font-mono)"
                  fontSize="14"
                  fill="var(--color-ink)"
                >
                  {s.name.slice(0, 4)}
                </text>
              </g>
            );
          });
        })}
      </svg>
      <SkillPanel skill={active} />
    </div>
  );
}
