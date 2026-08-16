import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Check, Sparkles } from 'lucide-react';
import { createUnlimitedCheckout, fetchBillingMe, isTrialExhausted } from '../api/billingApi';
import { formatPriceCents } from '../utils/formatPrice';
import { useUserProfile } from '../context/UserProfileContext';
import { isAdminAccount } from '../utils/signInIntent';
import { PageHeader } from '../shell/PageHeader';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const MONTHLY_CENTS = 1199;
const ANNUAL_CENTS = 9999;
const ANNUAL_LIST_CENTS = MONTHLY_CENTS * 12;

export function Upgrade() {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const isAdmin = isAdminAccount(profile);
  const [searchParams] = useSearchParams();
  const [plan, setPlan] = useState<'annual' | 'monthly'>('annual');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyUnlimited, setAlreadyUnlimited] = useState(false);
  const cancelled = searchParams.get('checkout') === 'cancelled';

  useEffect(() => {
    if (isAdmin) return;
    let mounted = true;
    fetchBillingMe()
      .then((me) => {
        if (mounted) {
          setAlreadyUnlimited(!!me.status && ['active', 'trialing', 'past_due'].includes(me.status));
        }
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, [isAdmin]);

  const subscribe = async () => {
    setBusy(true);
    setError(null);
    try {
      window.location.href = await createUnlimitedCheckout(plan);
    } catch (err) {
      setError(isTrialExhausted(err)
        ? 'Checkout is unavailable. Please try again later.'
        : ((err as Error)?.message || 'Checkout is unavailable. Please try again later.'));
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        label="Unlimited"
        title="Generate without limits"
        description="Browse and enroll stay free. Unlimited covers course generation — YouTube to a knowledge set."
      />

      {cancelled && (
        <p className="mb-4 rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Checkout was cancelled. You can pick a plan whenever you’re ready.
        </p>
      )}
      {isAdmin ? (
        <p className="mb-4 rounded-md border border-border bg-muted/40 px-4 py-3 text-sm">
          Platform admin accounts have Unlimited generation with no payment. Checkout is not required.
        </p>
      ) : alreadyUnlimited ? (
        <p className="mb-4 rounded-md border border-border bg-muted/40 px-4 py-3 text-sm">
          You’re already on Unlimited.{' '}
          <button type="button" className="underline" onClick={() => navigate('/settings?tab=billing')}>
            Manage billing
          </button>
        </p>
      ) : null}

      {isAdmin ? null : (
      <>
      <div className="mb-4 inline-flex rounded-lg border border-border p-1">
        <button
          type="button"
          onClick={() => setPlan('annual')}
          className={`rounded-md px-4 py-1.5 text-sm ${plan === 'annual' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
        >
          Annual
        </button>
        <button
          type="button"
          onClick={() => setPlan('monthly')}
          className={`rounded-md px-4 py-1.5 text-sm ${plan === 'monthly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
        >
          Monthly
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className={plan === 'annual' ? 'ring-2 ring-primary' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif-display text-lg font-normal">Annual</CardTitle>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-medium text-primary">
                Recommended
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-3xl font-semibold">{formatPriceCents(ANNUAL_CENTS)}<span className="text-sm font-normal text-muted-foreground"> / year</span></p>
            <p className="text-muted-foreground line-through">{formatPriceCents(ANNUAL_LIST_CENTS)}/yr</p>
            <p>Save 31% vs paying monthly.</p>
            <ul className="space-y-1.5 text-muted-foreground">
              <li className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0" /> 3 free generated courses, then Unlimited</li>
              <li className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0" /> Renews at $99.99 / year until you cancel</li>
            </ul>
            {plan === 'annual' && (
              <Button className="w-full" onClick={() => void subscribe()} disabled={busy || alreadyUnlimited}>
                {busy ? 'Redirecting…' : 'Continue to checkout'}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className={plan === 'monthly' ? 'ring-2 ring-primary' : ''}>
          <CardHeader>
            <CardTitle className="font-serif-display text-lg font-normal">Monthly</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-3xl font-semibold">{formatPriceCents(MONTHLY_CENTS)}<span className="text-sm font-normal text-muted-foreground"> / month</span></p>
            <p className="text-muted-foreground">{formatPriceCents(ANNUAL_LIST_CENTS)} if billed monthly for a year</p>
            <ul className="space-y-1.5 text-muted-foreground">
              <li className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0" /> Cancel any time from Billing</li>
              <li className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0" /> Monthly charges are non-refundable</li>
            </ul>
            {plan === 'monthly' && (
              <Button className="w-full" onClick={() => void subscribe()} disabled={busy || alreadyUnlimited}>
                {busy ? 'Redirecting…' : 'Continue to checkout'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-8 space-y-2 text-xs text-muted-foreground">
        <p>Unlimited renews at $99.99/year or $11.99/month until you cancel in Settings → Billing.</p>
        <p>Monthly payments are non-refundable. Annual plans can request a full refund within 14 days of first payment.</p>
        <p>
          By continuing you agree to the{' '}
          <Link to="/terms" className="underline">Terms of Service</Link>
          {' '}and{' '}
          <Link to="/privacy" className="underline">Privacy Policy</Link>.
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
          setMessage('Unlimited is active.');
          return;
        }
      } catch {
        /* webhook may still be in flight */
      }
      n += 1;
      if (n > 20) {
        setMessage('Payment received — access can take a few seconds. Check Settings → Billing if Unlimited isn’t showing yet.');
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
      <Sparkles className="mx-auto mb-4 text-primary" />
      <h1 className="font-serif-display text-2xl">Thank you</h1>
      <p className="mt-3 text-sm text-muted-foreground">{message}</p>
      <div className="mt-6 flex justify-center gap-3">
        <Button onClick={() => navigate('/educator-studio')}>Generate a course</Button>
        <Button variant="outline" onClick={() => navigate('/settings?tab=billing')}>Billing</Button>
      </div>
    </div>
  );
}
