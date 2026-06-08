function formatDelta(delta: number | null): { text: string; cls: string } {
  if (delta === null) return { text: 'nouveau', cls: 'dash-delta-up' };
  if (Math.abs(delta) < 0.5) return { text: '—', cls: 'dash-delta-flat' };
  const rounded = Math.round(delta);
  return delta > 0
    ? { text: `▲ +${rounded}%`, cls: 'dash-delta-up' }
    : { text: `▼ ${rounded}%`, cls: 'dash-delta-down' };
}

export function StatCard({
  han,
  label,
  value,
  delta
}: {
  han: string;
  label: string;
  value: string;
  delta: number | null;
}) {
  const d = formatDelta(delta);
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
