import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Sparkles } from 'lucide-react';
import { createUnlimitedCheckout, fetchBillingMe, hasPaidSubscription, isTrialExhausted } from '../api/billingApi';
import { useUserProfile } from '../context/UserProfileContext';
import type { StudentCheckoutPlan } from '../lib/studentPricing';
import { isAdminAccount, isEducatorAccount } from '../utils/signInIntent';
import { PageHeader } from '../shell/PageHeader';
import { StudentPricingPlans } from './StudentPricingPlans';
import { Button } from './ui/button';

export function Upgrade() {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const isAdmin = isAdminAccount(profile);
  const studioAccount = isEducatorAccount(profile);
  const [searchParams] = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyUnlimited, setAlreadyUnlimited] = useState(false);
  const cancelled = searchParams.get('checkout') === 'cancelled';

  useEffect(() => {
    if (studioAccount) return;
    let mounted = true;
    fetchBillingMe()
      .then((me) => {
        if (mounted) {
          setAlreadyUnlimited(hasPaidSubscription(me));
        }
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, [studioAccount]);

  const subscribe = async (plan: StudentCheckoutPlan) => {
    setBusy(true);
    setError(null);
    try {
      window.location.href = await createUnlimitedCheckout(plan);
    } catch (err) {
      setError(
        isTrialExhausted(err)
          ? 'Checkout is unavailable. Please try again later.'
          : ((err as Error)?.message || 'Checkout is unavailable. Please try again later.'),
      );
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        label="Plan"
        title="Student plans"
        description="Upgrade for unlimited practice, a personal tutor, and offline downloads. Student pricing only."
      />

      {cancelled && (
        <p
          className="mb-4 rounded-md border px-4 py-3 text-sm"
          style={{ borderColor: 'var(--border)', background: 'var(--fill)', color: 'var(--ink-soft)' }}
        >
          Checkout was cancelled. You can pick a plan whenever you’re ready.
        </p>
      )}
      {studioAccount ? (
        <p
          className="mb-4 rounded-md border px-4 py-3 text-sm"
          style={{ borderColor: 'var(--border)', background: 'var(--fill)', color: 'var(--ink)' }}
        >
          {isAdmin
            ? 'Platform admin accounts have full access with no payment. Checkout is not required.'
            : 'This account has full access with no payment. Checkout is not required.'}
        </p>
      ) : alreadyUnlimited ? (
        <p
          className="mb-4 rounded-md border px-4 py-3 text-sm"
          style={{ borderColor: 'var(--border)', background: 'var(--fill)', color: 'var(--ink)' }}
        >
          You’re already on a paid plan.{' '}
          <button
            type="button"
            className="underline"
            style={{ color: 'var(--ink)' }}
            onClick={() => navigate('/settings?tab=billing')}
          >
            Manage billing
          </button>
        </p>
      ) : null}

      {studioAccount ? null : (
        <>
          <StudentPricingPlans
            busy={busy}
            disabled={alreadyUnlimited}
            onCheckout={(plan) => void subscribe(plan)}
            onStayFree={() => navigate('/dashboard')}
          />

          {error && (
            <p className="mt-4 text-sm" style={{ color: 'var(--destructive, #ef4444)' }}>
              {error}
            </p>
          )}

          <div className="mt-8 space-y-2 text-xs" style={{ color: 'var(--ink-faint)' }}>
            <p>
              Monthly and annual Pro use checkout. Quarterly and Sprint Pass are arranged through support for now.
            </p>
            <p>
              By continuing you agree to the{' '}
              <Link to="/terms" className="underline" style={{ color: 'var(--ink-soft)' }}>
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="underline" style={{ color: 'var(--ink-soft)' }}>
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export function UpgradeSuccess() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Confirming your subscription…');

  useEffect(() => {
    let n = 0;
    let cancelled = false;
    const tick = async () => {
      try {
        const me = await fetchBillingMe();
        if (cancelled) return;
        if (me.hasUnlimited && me.status && ['active', 'trialing', 'past_due'].includes(me.status)) {
          setMessage('Your Student plan is active.');
          return;
        }
      } catch {
        /* webhook may still be in flight */
      }
      n += 1;
      if (n > 20) {
        setMessage(
          'Payment received — access can take a few seconds. Check Settings → Plan if it isn’t showing yet.',
        );
        return;
      }
      window.setTimeout(() => void tick(), 1500);
    };
    void tick();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-lg py-8 text-center">
      <Sparkles className="mx-auto mb-4" style={{ color: 'var(--accent)' }} />
      <h1 className="text-2xl font-semibold" style={{ color: 'var(--ink)' }}>
        Thank you
      </h1>
      <p className="mt-3 text-sm" style={{ color: 'var(--ink-soft)' }}>
        {message}
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Button onClick={() => navigate('/dashboard')}>Back to Home</Button>
        <Button variant="outline" onClick={() => navigate('/settings')}>
          Settings
        </Button>
      </div>
    </div>
  );
}
