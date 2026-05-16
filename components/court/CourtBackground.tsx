import { COURT } from './court-zones';

export function CourtBackground({ opacity = 0.18 }: { opacity?: number }) {
  return (
    <svg
      viewBox={`0 0 ${COURT.vbWidth} ${COURT.vbHeight}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className="fixed inset-0 -z-10 w-full h-full"
      style={{ opacity }}
    >
      <rect
        x="2"
        y="2"
        width={COURT.vbWidth - 4}
        height={COURT.vbHeight - 4}
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
      <line
        x1={COURT.net - COURT.shortServiceLine}
        y1="0"
        x2={COURT.net - COURT.shortServiceLine}
        y2={COURT.vbHeight}
        stroke="var(--color-court-line)"
        strokeWidth="2"
      />
      <line
        x1={COURT.net + COURT.shortServiceLine}
        y1="0"
        x2={COURT.net + COURT.shortServiceLine}
        y2={COURT.vbHeight}
        stroke="var(--color-court-line)"
        strokeWidth="2"
      />
      <line
        x1="2"
        y1={COURT.vbHeight / 2}
        x2={COURT.net - COURT.shortServiceLine}
        y2={COURT.vbHeight / 2}
        stroke="var(--color-court-line)"
        strokeWidth="2"
      />
      <line
        x1={COURT.net + COURT.shortServiceLine}
        y1={COURT.vbHeight / 2}
        x2={COURT.vbWidth - 2}
        y2={COURT.vbHeight / 2}
        stroke="var(--color-court-line)"
        strokeWidth="2"
      />
      <line
        x1="2"
        y1={COURT.backServiceDoubles}
        x2={COURT.vbWidth - 2}
        y2={COURT.backServiceDoubles}
        stroke="var(--color-court-line)"
        strokeWidth="1.5"
        strokeDasharray="6 6"
      />
      <line
        x1="2"
        y1={COURT.vbHeight - COURT.backServiceDoubles}
        x2={COURT.vbWidth - 2}
        y2={COURT.vbHeight - COURT.backServiceDoubles}
        stroke="var(--color-court-line)"
        strokeWidth="1.5"
        strokeDasharray="6 6"
      />
    </svg>
  );
}
