import { Link } from 'react-router';
import { useTheme } from './ThemeContext';
import { LandingNav } from './landing/LandingNav';

export function LegalPage({ kind }: { kind: 'terms' | 'privacy' }) {
  const { isDark } = useTheme();
  const title = kind === 'terms' ? 'Terms of Service' : 'Privacy Policy';
  return (
    <div className={`landing-page min-h-screen ${isDark ? '' : 'light'}`}>
      <LandingNav isDark={isDark} />
      <article className="mx-auto max-w-2xl px-5 pb-16 pt-24 text-[var(--landing-fg)]">
        <p className="landing-mono-label mb-2">Legal</p>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-6 text-sm leading-relaxed text-[var(--landing-muted)]">
          {kind === 'terms'
            ? 'Cuib Unlimited is a subscription for course generation. Catalog browse and enroll are free. Monthly charges are non-refundable. Annual subscriptions may request a full refund within 14 days of first payment. Cancel anytime from Settings → Billing. Generate access continues until the end of the paid period if you cancel.'
            : 'We use your Google account email to create your Cuib login, Stripe to process Unlimited payments, and course-generation providers to turn YouTube URLs into knowledge sets. We do not store full card numbers. See Stripe’s privacy policy for payment processing.'}
        </p>
        <Link to="/" className="mt-8 inline-block text-sm underline">Back to home</Link>
      </article>
    </div>
  );
}
