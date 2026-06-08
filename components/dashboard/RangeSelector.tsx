'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const RANGES = [7, 30, 90] as const;

export function RangeSelector() {
  const router = useRouter();
  const params = useSearchParams();
  const current = Number(params.get('range')) || 30;

  function select(days: number) {
    const next = new URLSearchParams(params.toString());
    next.set('range', String(days));
    router.replace(`/dashboard?${next.toString()}`, { scroll: false });
  }

  return (
    <div className="flex gap-2">
      {RANGES.map((d) => (
        <button
          key={d}
          type="button"
          className="dash-range-tab"
          data-active={current === d}
          onClick={() => select(d)}
        >
          {d}J
        </button>
      ))}
    </div>
  );
}
