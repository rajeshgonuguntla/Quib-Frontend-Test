import { useMemo } from 'react';
import type { EnrollmentTrendPoint } from '../../api/educatorAnalyticsApi';

type TrendBarChartProps = {
  points: EnrollmentTrendPoint[];
  maxBars?: number;
  className?: string;
  heightClass?: string;
};

/** Lightweight CSS bar chart — brand-accented, hover tooltips. */
export function TrendBarChart({
  points,
  maxBars = 30,
  className,
  heightClass = 'h-36',
}: TrendBarChartProps) {
  const bars = useMemo(() => {
    const slice = points.length > maxBars ? points.slice(points.length - maxBars) : points;
    const peak = Math.max(1, ...slice.map((p) => p.count));
    const total = slice.reduce((sum, p) => sum + p.count, 0);
    return {
      items: slice.map((p) => ({
        ...p,
        heightPercent: (p.count / peak) * 100,
        label: formatShortDate(p.date),
      })),
      total,
      peak,
    };
  }, [points, maxBars]);

  if (bars.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="mb-2 size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-lg">
          —
        </div>
        <p className="text-sm text-muted-foreground">No enrollment data yet.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className={`flex items-end gap-1 ${heightClass}`}>
        {bars.items.map((bar) => (
          <div key={bar.date} className="group relative flex min-w-0 flex-1 flex-col items-center justify-end h-full">
            <div
              className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-0.5 text-[0.65rem] font-medium text-background opacity-0 shadow-md transition-opacity group-hover:opacity-100"
            >
              {bar.label}: {bar.count}
            </div>
            <div
              className="w-full rounded-t-sm transition-all duration-200 group-hover:opacity-100"
              style={{
                height: `${Math.max(bar.heightPercent, bar.count > 0 ? 10 : 3)}%`,
                background: bar.count > 0
                  ? 'linear-gradient(to top, var(--chart-1), color-mix(in srgb, var(--chart-1) 55%, transparent))'
                  : 'var(--muted)',
                opacity: bar.count > 0 ? 0.88 : 1,
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-[0.65rem] text-muted-foreground">
        <span>{bars.items[0]?.label}</span>
        <span className="font-medium text-foreground/70">{bars.total} total</span>
        <span>{bars.items[bars.items.length - 1]?.label}</span>
      </div>
    </div>
  );
}

function formatShortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}
