import { useState } from 'react';
import type { EnrollmentTrendPoint, EnrollmentTrends } from '../../api/educatorAnalyticsApi';
import { TrendBarChart } from './TrendBarChart';

export type EnrollmentTrendGranularity = 'daily' | 'weekly' | 'monthly';

const GRANULARITY_OPTIONS: { id: EnrollmentTrendGranularity; label: string; period: string }[] = [
  { id: 'daily', label: 'Daily', period: '90 days' },
  { id: 'weekly', label: 'Weekly', period: '26 weeks' },
  { id: 'monthly', label: 'Monthly', period: '12 months' },
];

type EnrollmentTrendPanelProps = {
  trends: EnrollmentTrends;
  maxBars?: number;
  heightClass?: string;
  className?: string;
};

export function EnrollmentTrendPanel({
  trends,
  maxBars,
  heightClass,
  className,
}: EnrollmentTrendPanelProps) {
  const [granularity, setGranularity] = useState<EnrollmentTrendGranularity>('daily');
  const safeTrends: EnrollmentTrends = trends ?? { daily: [], weekly: [], monthly: [] };
  const active = GRANULARITY_OPTIONS.find((o) => o.id === granularity) ?? GRANULARITY_OPTIONS[0];
  const points: EnrollmentTrendPoint[] = safeTrends[granularity] ?? [];

  return (
    <div className={className}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-lg border border-border/80 bg-muted/40 p-0.5">
          {GRANULARITY_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setGranularity(option.id)}
              className={`rounded-md px-3 py-1.5 text-[0.72rem] font-medium transition-colors ${
                granularity === option.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <span className="text-[0.65rem] text-muted-foreground">{active.period}</span>
      </div>
      <TrendBarChart
        points={points}
        maxBars={maxBars ?? defaultMaxBars(granularity)}
        heightClass={heightClass}
        granularity={granularity}
      />
    </div>
  );
}

function defaultMaxBars(granularity: EnrollmentTrendGranularity): number {
  switch (granularity) {
    case 'weekly':
      return 26;
    case 'monthly':
      return 12;
    default:
      return 30;
  }
}
