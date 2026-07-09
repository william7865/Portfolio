export type DeltaUnit = 'pct' | 'pts';

function formatDelta(delta: number | null, unit: DeltaUnit): { text: string; cls: string } {
  if (delta === null) return { text: 'nouveau', cls: 'dash-delta-up' };
  if (Math.abs(delta) < 0.5) return { text: '—', cls: 'dash-delta-flat' };
  const rounded = Math.round(delta);
  // A delta on a value that is already a percentage is a difference in points, not a ratio.
  const suffix = unit === 'pts' ? ' pts' : '%';
  return delta > 0
    ? { text: `▲ +${rounded}${suffix}`, cls: 'dash-delta-up' }
    : { text: `▼ ${rounded}${suffix}`, cls: 'dash-delta-down' };
}

export function StatCard({
  han,
  label,
  value,
  delta,
  deltaUnit = 'pct'
}: {
  han: string;
  label: string;
  value: string;
  delta: number | null;
  deltaUnit?: DeltaUnit;
}) {
  const d = formatDelta(delta, deltaUnit);
  return (
    <div className="dash-card">
      <div className="dash-cartouche mb-3">
        <span className="han">{han}</span>
        <span className="kicker">{label}</span>
      </div>
      <div className="dash-stat-value">{value}</div>
      <div className={`mt-2 font-mono text-xs ${d.cls}`}>{d.text}</div>
    </div>
  );
}
