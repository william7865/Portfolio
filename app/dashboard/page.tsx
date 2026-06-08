import { requireSession } from '@/lib/analytics/guard';
import {
  normalizeRange,
  getKpis,
  getDailySeries,
  getTopPages,
  getReferrers,
  getCountries,
  getDevices
} from '@/lib/analytics/queries';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { StatCard } from '@/components/dashboard/StatCard';
import { FrequencyChart } from '@/components/dashboard/FrequencyChart';
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

  const [kpis, series, pages, referrers, countries, devices] = await Promise.all([
    getKpis(range),
    getDailySeries(range),
    getTopPages(range),
    getReferrers(range),
    getCountries(range),
    getDevices(range)
  ]);

  return (
    <DashboardShell>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard han="量" label="Vues" value={String(kpis.views)} delta={kpis.deltas.views} />
        <StatCard han="人" label="Uniques / jour" value={String(kpis.uniques)} delta={kpis.deltas.uniques} />
        <StatCard han="國" label="Pays" value={String(kpis.countries)} delta={kpis.deltas.countries} />
        <StatCard han="機" label="Mobile" value={`${kpis.mobilePct}%`} delta={kpis.deltas.mobilePct} />
      </div>

      <div className="mb-6">
        <FrequencyChart data={series} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <RankBars title="Top pages" han="頁" rows={pages} />
        <RankBars title="Provenance" han="源" rows={referrers} emptyLabel="Aucun référent externe" />
        <RankBars title="Pays" han="國" rows={countries} />
        <RankBars title="Appareils" han="機" rows={devices} />
      </div>
    </DashboardShell>
  );
}
