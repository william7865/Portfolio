import { requireSession } from '@/lib/analytics/guard';
import { RANGES } from '@/lib/analytics/range';
import {
  normalizeRange,
  getKpis,
  getSeries,
  getTopPages,
  getReferrers,
  getCountries,
  getDevices,
  getLanguages,
  getHourly
} from '@/lib/analytics/queries';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { StatCard } from '@/components/dashboard/StatCard';
import { FrequencyChart } from '@/components/dashboard/FrequencyChart';
import { HourlyChart } from '@/components/dashboard/HourlyChart';
import { RankBars } from '@/components/dashboard/RankBars';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  await requireSession();

  const { range: rangeParam } = await searchParams;
  const range = normalizeRange(rangeParam);
  const { bucket } = RANGES[range];

  const [kpis, series, hourly, pages, referrers, countries, devices, languages] = await Promise.all([
    getKpis(range),
    getSeries(range),
    getHourly(range),
    getTopPages(range),
    getReferrers(range),
    getCountries(range),
    getDevices(range),
    getLanguages(range)
  ]);

  return (
    <DashboardShell>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard han="量" label="Vues" value={String(kpis.views)} delta={kpis.deltas.views} />
        <StatCard
          han="人"
          label="Visiteurs / jour"
          value={String(kpis.uniquesPerDay)}
          delta={kpis.deltas.uniquesPerDay}
        />
        <StatCard han="國" label="Pays" value={String(kpis.countries)} delta={kpis.deltas.countries} />
        <StatCard
          han="機"
          label="Mobile"
          value={`${kpis.mobilePct}%`}
          delta={kpis.deltas.mobilePct}
          deltaUnit="pts"
        />
      </div>

      <div className="mb-6">
        <FrequencyChart data={series} bucket={bucket} />
      </div>

      <div className="mb-6">
        <HourlyChart data={hourly} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <RankBars title="Top pages" han="頁" rows={pages} />
        <RankBars title="Provenance" han="源" rows={referrers} emptyLabel="Aucun référent externe" />
        <RankBars title="Pays" han="國" rows={countries} />
        <RankBars title="Langues" han="語" rows={languages} />
        <RankBars title="Appareils" han="機" rows={devices} />
      </div>
    </DashboardShell>
  );
}
