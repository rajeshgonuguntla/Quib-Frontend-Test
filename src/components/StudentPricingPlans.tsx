import { Check } from 'lucide-react';
import { BRAND_SUPPORT_EMAIL } from '../brand';
import {
  STUDENT_ADDONS,
  STUDENT_FREE_FEATURES,
  STUDENT_PRO_FEATURES,
  STUDENT_SPRINT_FEATURES,
  type StudentCheckoutPlan,
} from '../lib/studentPricing';
import { Button } from './ui/button';

type Props = {
  busy?: boolean;
  disabled?: boolean;
  onCheckout?: (plan: StudentCheckoutPlan) => void;
  onStayFree?: () => void;
};

function FeatureList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-4 space-y-2 text-left text-sm leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <Check
            size={14}
            strokeWidth={2.2}
            className="mt-0.5 shrink-0"
            style={{ color: 'var(--accent)' }}
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function StudentPricingPlans({ busy = false, disabled = false, onCheckout, onStayFree }: Props) {
  const supportMailto = `mailto:${BRAND_SUPPORT_EMAIL}?subject=${encodeURIComponent('Student plan inquiry')}`;

  return (
    <div className="mx-auto max-w-6xl pb-2 text-left">
      <p className="text-center text-[12px]" style={{ color: 'var(--ink-faint)' }}>
        Prices include GST for India. Student plans only.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,0.9fr)] lg:items-stretch">
        <article
          className="flex flex-col rounded-xl border p-5"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <h3 className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>
            Free
          </h3>
          <p className="mt-1 text-3xl font-semibold tracking-tight" style={{ color: 'var(--ink)' }}>
            ₹0
          </p>
          <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>
            $0
          </p>
          <FeatureList items={STUDENT_FREE_FEATURES} />
          <Button
            type="button"
            variant="outline"
            className="mt-auto min-h-11 w-full"
            disabled={disabled}
            onClick={onStayFree}
          >
            Stay on Free
          </Button>
        </article>

        <article
          className="flex flex-col rounded-xl border p-5"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <h3 className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>
            Pro
          </h3>
          <FeatureList items={STUDENT_PRO_FEATURES} />
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="flex flex-col rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                Monthly
              </p>
              <p className="mt-1 text-xl font-semibold" style={{ color: 'var(--ink)' }}>
                ₹1,000
              </p>
              <p className="text-[12px]" style={{ color: 'var(--ink-soft)' }}>
                $12 a month
              </p>
              <p className="mb-3 text-[12px]" style={{ color: 'var(--ink-soft)' }}>
                7-day free trial
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-auto min-h-11 w-full"
                disabled={busy || disabled}
                onClick={() => onCheckout?.('monthly')}
              >
                {busy ? 'Redirecting…' : 'Start 7-day trial'}
              </Button>
            </div>
            <div className="flex flex-col rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                Quarterly
              </p>
              <p className="mt-1 text-xl font-semibold" style={{ color: 'var(--ink)' }}>
                ₹2,700
              </p>
              <p className="text-[12px]" style={{ color: 'var(--ink-soft)' }}>
                $32 every 3 months
              </p>
              <p className="mb-3 text-[12px]" style={{ color: 'var(--ink-soft)' }}>
                About 10% off
              </p>
              <Button asChild variant="outline" className="mt-auto min-h-11 w-full" disabled={disabled}>
                <a href={supportMailto}>Ask about Pro</a>
              </Button>
            </div>
            <div
              className="flex flex-col rounded-lg border p-3"
              style={{
                borderColor: 'var(--accent)',
                background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
              }}
            >
              <p className="text-[11px] font-medium" style={{ color: 'var(--accent)' }}>
                Best value
              </p>
              <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                Annual
              </p>
              <p className="mt-1 text-xl font-semibold" style={{ color: 'var(--ink)' }}>
                ₹9,000
              </p>
              <p className="text-[12px]" style={{ color: 'var(--ink-soft)' }}>
                $99 a year
              </p>
              <p className="text-[12px]" style={{ color: 'var(--ink-soft)' }}>
                ₹750 a month
              </p>
              <p className="text-[12px]" style={{ color: 'var(--ink-soft)' }}>
                About 25% off
              </p>
              <p className="mb-3 mt-2 text-[12px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                2 full-length mock tests a month, with detailed analysis
              </p>
              <Button
                type="button"
                className="mt-auto min-h-11 w-full"
                disabled={busy || disabled}
                onClick={() => onCheckout?.('annual')}
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                {busy ? 'Redirecting…' : 'Start Pro'}
              </Button>
            </div>
          </div>
        </article>

        <article
          className="flex flex-col rounded-xl border p-5"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <h3 className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>
            Exam Sprint Pass
          </h3>
          <p className="mt-1 text-3xl font-semibold tracking-tight" style={{ color: 'var(--ink)' }}>
            ₹3,500
          </p>
          <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>
            $40
          </p>
          <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>
            One-time, for 90 days
          </p>
          <FeatureList items={STUDENT_SPRINT_FEATURES} />
          <Button asChild variant="outline" className="mt-auto min-h-11 w-full" disabled={disabled}>
            <a href={supportMailto}>Get the Sprint Pass</a>
          </Button>
        </article>
      </div>

      <h3 className="mt-10 text-center text-sm font-semibold" style={{ color: 'var(--ink)' }}>
        Add-ons
      </h3>
      <p className="mt-1 text-center text-[12px]" style={{ color: 'var(--ink-faint)' }}>
        Priced in Indian rupees.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {STUDENT_ADDONS.map((addon) => (
          <article
            key={addon.title}
            className="rounded-xl border px-4 py-4"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
              {addon.title}
            </p>
            <p className="mt-1 text-sm" style={{ color: 'var(--ink-soft)' }}>
              {addon.price}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
