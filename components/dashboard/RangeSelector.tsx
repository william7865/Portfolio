'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { RANGE_KEYS, normalizeRange, type RangeKey } from '@/lib/analytics/range';

const TAB_LABEL: Record<RangeKey, string> = {
  '24h': '24H',
  '7d': '7J',
  '30d': '30J',
  '90d': '90J'
};

export function RangeSelector() {
  const router = useRouter();
  const params = useSearchParams();
  const current = normalizeRange(params.get('range') ?? undefined);

  function select(key: RangeKey) {
    const next = new URLSearchParams(params.toString());
    next.set('range', key);
    router.replace(`/dashboard?${next.toString()}`, { scroll: false });
  }

  return (
    <div className="flex gap-2">
      {RANGE_KEYS.map((key) => (
        <button
          key={key}
          type="button"
          className="dash-range-tab"
          data-active={current === key}
          onClick={() => select(key)}
        >
          {TAB_LABEL[key]}
        </button>
      ))}
    </div>
  );
}
