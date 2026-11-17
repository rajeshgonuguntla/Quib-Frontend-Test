import { useState } from 'react';
import { Link } from 'react-router';
import { Check } from 'lucide-react';
import { SIGN_IN_HASH_PATH } from '../../utils/navigation';
import { BRAND_SUPPORT_EMAIL } from '../../brand';

type Audience = 'students' | 'educators';

const STUDENT_FREE = [
  'Limited daily practice questions',
  'Saved explanations',
  '3 tutor chats a week',
  'Basic progress view',
] as const;

const STUDENT_PRO = [
  'Unlimited practice questions',
  'A daily study plan',
  'A weekly parent progress report',
  'The full personal tutor',
  'The mistake notebook + Cubit Notes',
] as const;

const STUDENT_SPRINT = [
  'Full Pro for 90 days',
  'No subscription',
  'Built around a test date',
  'Target your weak areas',
  'Build on your strengths',
  'Track your practice',
] as const;

const EDUCATOR_PRO = [
  'Unlimited courses',
  'Full course builder (lessons, question banks, mock tests)',
  'Customize with your own logo and colours',
  'One-click deploy with a shareable course link',
  'The AI tutor trained on your course material for every student',
  'Student progress analytics',
] as const;

const EDUCATOR_INSTITUTE = [
  'Everything in Pro',
  '10 teacher seats',
  'Your own domain and white-label',
  'A shared question bank across teachers',
  'Priority support',
] as const;

function FeatureList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-4 space-y-2 text-left text-sm leading-relaxed text-[var(--landing-muted)]">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <Check
            size={14}
            strokeWidth={2.2}
            className="mt-0.5 shrink-0"
            style={{ color: 'var(--brand, #ff7a1a)' }}
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function OutlineCta({
  to,
  onClick,
  children,
}: {
  to: string;
  onClick?: () => void;
  children: string;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="mt-auto inline-flex min-h-11 w-full items-center justify-center rounded-md border border-[var(--landing-border)] px-4 text-sm font-medium text-[var(--landing-fg)] no-underline transition-opacity hover:opacity-90"
    >
      {children}
    </Link>
  );
}

function BrandCta({
  to,
  onClick,
  children,
}: {
  to: string;
  onClick?: () => void;
  children: string;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="mt-auto inline-flex min-h-11 w-full items-center justify-center rounded-md px-4 text-sm font-medium text-white no-underline transition-opacity hover:opacity-90"
      style={{ background: 'var(--brand, #ff7a1a)' }}
    >
      {children}
    </Link>
  );
}

export function LandingPricingContent({ onGetStarted }: { onGetStarted?: () => void }) {
  const [audience, setAudience] = useState<Audience>('students');
  const signIn = SIGN_IN_HASH_PATH;
  const talkToUs = `mailto:${BRAND_SUPPORT_EMAIL}`;

  return (
    <div className="mx-auto max-w-6xl pb-8 text-center">
      <p className="landing-mono-label mb-3">Pricing</p>
      {audience === 'students' ? (
        <>
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--landing-fg)] md:text-4xl">
            A personal tutor from about ₹25 a day
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[var(--landing-muted)] md:text-base">
            SAT and GRE prep, with a tutor for each student.
            <br />
            Parents receive a weekly progress report.
          </p>
        </>
      ) : (
        <>
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--landing-fg)] md:text-4xl">
            Build your course. Every student gets a tutor.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[var(--landing-muted)] md:text-base">
            Create, customize and deploy your own courses on Cubit. Each of your students gets Cubit’s AI personal tutor on that course.
          </p>
        </>
      )}

      <div
        className="mx-auto mt-6 inline-flex rounded-full border border-[var(--landing-border)] bg-[var(--landing-card)] p-1"
        role="tablist"
        aria-label="Pricing audience"
      >
        {(['students', 'educators'] as const).map((id) => {
          const active = audience === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setAudience(id)}
              className="inline-flex min-h-11 min-w-[7.5rem] items-center justify-center rounded-full px-4 text-sm transition-colors"
              style={{
                fontWeight: active ? 600 : 400,
                color: active ? 'var(--landing-fg)' : 'var(--landing-muted)',
                background: active ? 'var(--landing-bg)' : 'transparent',
              }}
            >
              {id === 'students' ? 'Students' : 'Educators'}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[12px] text-[var(--landing-muted)]">Prices include GST for India.</p>

      {audience === 'students' ? (
        <>
          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,0.9fr)] lg:items-stretch">
            <article className="flex flex-col rounded-xl border border-[var(--landing-border)] bg-[var(--landing-card)] p-5 text-left">
              <h3 className="text-lg font-semibold text-[var(--landing-fg)]">Free</h3>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-[var(--landing-fg)]">₹0</p>
              <p className="text-sm text-[var(--landing-muted)]">$0</p>
              <FeatureList items={STUDENT_FREE} />
              <OutlineCta to={signIn} onClick={onGetStarted}>
                Start free
              </OutlineCta>
            </article>

            <article className="flex flex-col rounded-xl border border-[var(--landing-border)] bg-[var(--landing-card)] p-5 text-left">
              <h3 className="text-lg font-semibold text-[var(--landing-fg)]">Pro</h3>
              <FeatureList items={STUDENT_PRO} />
              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="flex flex-col rounded-lg border border-[var(--landing-border)] p-3">
                  <p className="text-sm font-medium text-[var(--landing-fg)]">Monthly</p>
                  <p className="mt-1 text-xl font-semibold text-[var(--landing-fg)]">₹1,000</p>
                  <p className="text-[12px] text-[var(--landing-muted)]">$12 a month</p>
                  <p className="mb-3 text-[12px] text-[var(--landing-muted)]">7-day free trial</p>
                  <OutlineCta to={signIn} onClick={onGetStarted}>
                    Start 7-day trial
                  </OutlineCta>
                </div>
                <div className="flex flex-col rounded-lg border border-[var(--landing-border)] p-3">
                  <p className="text-sm font-medium text-[var(--landing-fg)]">Quarterly</p>
                  <p className="mt-1 text-xl font-semibold text-[var(--landing-fg)]">₹2,700</p>
                  <p className="text-[12px] text-[var(--landing-muted)]">$32 every 3 months</p>
                  <p className="mb-3 text-[12px] text-[var(--landing-muted)]">About 10% off</p>
                  <OutlineCta to={signIn} onClick={onGetStarted}>
                    Start Pro
                  </OutlineCta>
                </div>
                <div
                  className="flex flex-col rounded-lg border p-3"
                  style={{
                    borderColor: 'var(--brand, #ff7a1a)',
                    background: 'color-mix(in srgb, var(--brand, #ff7a1a) 12%, transparent)',
                  }}
                >
                  <p className="text-[11px] font-medium" style={{ color: 'var(--brand, #ff7a1a)' }}>
                    Best value
                  </p>
                  <p className="text-sm font-medium text-[var(--landing-fg)]">Annual</p>
                  <p className="mt-1 text-xl font-semibold text-[var(--landing-fg)]">₹9,000</p>
                  <p className="text-[12px] text-[var(--landing-muted)]">$99 a year</p>
                  <p className="text-[12px] text-[var(--landing-muted)]">₹750 a month</p>
                  <p className="text-[12px] text-[var(--landing-muted)]">About 25% off</p>
                  <p className="mb-3 mt-2 text-[12px] leading-relaxed text-[var(--landing-muted)]">
                    2 full-length mock tests a month, with detailed analysis
                  </p>
                  <BrandCta to={signIn} onClick={onGetStarted}>
                    Start Pro
                  </BrandCta>
                </div>
              </div>
            </article>

            <article className="flex flex-col rounded-xl border border-[var(--landing-border)] bg-[var(--landing-card)] p-5 text-left">
              <h3 className="text-lg font-semibold text-[var(--landing-fg)]">Exam Sprint Pass</h3>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-[var(--landing-fg)]">₹3,500</p>
              <p className="text-sm text-[var(--landing-muted)]">$40</p>
              <p className="text-sm text-[var(--landing-muted)]">One-time, for 90 days</p>
              <FeatureList items={STUDENT_SPRINT} />
              <OutlineCta to={signIn} onClick={onGetStarted}>
                Get the Sprint Pass
              </OutlineCta>
            </article>
          </div>

          <h3 className="mt-10 text-sm font-semibold text-[var(--landing-fg)]">Add-ons</h3>
          <p className="mt-1 text-[12px] text-[var(--landing-muted)]">Priced in Indian rupees.</p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { title: 'GRE essay feedback pack', price: '₹299 for 10 essays' },
              { title: 'Extra mock test with analysis', price: '₹199 each' },
              { title: 'Sibling or friend discount', price: '20% off' },
            ].map((addon) => (
              <article
                key={addon.title}
                className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-card)] px-4 py-4 text-left"
              >
                <p className="text-sm font-medium text-[var(--landing-fg)]">{addon.title}</p>
                <p className="mt-1 text-sm text-[var(--landing-muted)]">{addon.price}</p>
              </article>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2 md:items-stretch">
            <article
              className="flex flex-col rounded-xl border p-5 text-left"
              style={{
                borderColor: 'var(--brand, #ff7a1a)',
                background: 'color-mix(in srgb, var(--brand, #ff7a1a) 12%, transparent)',
              }}
            >
              <p className="text-[11px] font-medium" style={{ color: 'var(--brand, #ff7a1a)' }}>
                Most popular
              </p>
              <h3 className="mt-1 text-lg font-semibold text-[var(--landing-fg)]">Educator Pro</h3>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-[var(--landing-fg)]">₹1,999</p>
              <p className="text-sm text-[var(--landing-muted)]">$24 a month</p>
              <p className="mt-1 text-sm text-[var(--landing-muted)]">+ ₹149 / $2 per active student a month</p>
              <p className="text-sm text-[var(--landing-muted)]">₹19,990 a year · 2 months free ($240)</p>
              <FeatureList items={EDUCATOR_PRO} />
              <BrandCta to={signIn} onClick={onGetStarted}>
                Start 14-day trial
              </BrandCta>
            </article>

            <article className="flex flex-col rounded-xl border border-[var(--landing-border)] bg-[var(--landing-card)] p-5 text-left">
              <h3 className="text-lg font-semibold text-[var(--landing-fg)]">Institute</h3>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-[var(--landing-fg)]">₹9,999</p>
              <p className="text-sm text-[var(--landing-muted)]">$119 a month</p>
              <p className="mt-1 text-sm text-[var(--landing-muted)]">+ ₹119 / $1.50 per active student a month</p>
              <p className="text-sm text-[var(--landing-muted)]">₹99,990 a year · 2 months free ($1,190)</p>
              <FeatureList items={EDUCATOR_INSTITUTE} />
              <a
                href={talkToUs}
                className="mt-auto inline-flex min-h-11 w-full items-center justify-center rounded-md border border-[var(--landing-border)] px-4 text-sm font-medium text-[var(--landing-fg)] no-underline transition-opacity hover:opacity-90"
              >
                Talk to us
              </a>
            </article>
          </div>
          <p className="mx-auto mt-8 max-w-xl text-[12px] leading-relaxed text-[var(--landing-muted)]">
            Annual billing: 2 months free on the platform fee.
            <br />
            An active student is anyone who used the course that month. You’re never charged for inactive students.
          </p>
        </>
      )}
    </div>
  );
}
