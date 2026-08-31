import axios from 'axios';

export const TRIAL_EXHAUSTED = 'TRIAL_EXHAUSTED';

export type BillingPlan = 'annual' | 'monthly';

export type BillingStatus = {
  hasUnlimited: boolean;
  trialCoursesUsed: number;
  trialLimit: number;
  complimentaryUntil?: string | null;
  plan?: string | null;
  status?: string | null;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | null;
  firstPaidAt?: string | null;
  refundEligible?: boolean;
};

export type ReferralStatus = {
  code: string;
  shareUrl: string;
  monthsEarned: number;
  maxMonths: number;
  referred: { displayName: string; createdAt: string; complimentaryUntil?: string | null }[];
};

const PAID_STATUSES = new Set(['active', 'trialing', 'past_due']);

/** Stripe subscription currently grants Unlimited — same gate as Upgrade.tsx. */
export function hasPaidSubscription(me: BillingStatus): boolean {
  return !!me.status && PAID_STATUSES.has(me.status);
}

export function hasActiveComplimentary(me: BillingStatus, now = Date.now()): boolean {
  if (!me.complimentaryUntil) return false;
  const until = Date.parse(me.complimentaryUntil);
  return Number.isFinite(until) && until > now;
}

/** Hide checkout CTAs — paid Stripe or referral complimentary month. */
export function hidesUpgradeCta(me: BillingStatus): boolean {
  return hasPaidSubscription(me) || hasActiveComplimentary(me);
}

export function billingPlanLabel(me: BillingStatus | null, isAdmin: boolean): string {
  if (isAdmin) return 'Admin';
  if (!me) return 'Free plan';
  if (hasPaidSubscription(me)) {
    if (me.plan === 'annual') return 'Unlimited annual';
    if (me.plan === 'monthly') return 'Unlimited monthly';
    return 'Unlimited';
  }
  if (hasActiveComplimentary(me)) return 'Unlimited';
  return 'Free plan';
}

export function isTrialExhausted(err: unknown): boolean {
  if (!axios.isAxiosError(err) || err.response?.status !== 402) {
    return false;
  }
  const code = (err.response.data as { code?: string } | undefined)?.code;
  return code === TRIAL_EXHAUSTED || !code;
}

async function checkoutUrlFrom(path: string, body?: object): Promise<string> {
  const { data } = await axios.post<{ checkoutUrl?: string; portalUrl?: string }>(path, body);
  const url = data.checkoutUrl ?? data.portalUrl;
  if (!url) {
    throw new Error('Billing URL missing from server response');
  }
  return url;
}

export async function fetchBillingMe(): Promise<BillingStatus> {
  const { data } = await axios.get<BillingStatus>('/api/billing/me');
  return data;
}

export async function createUnlimitedCheckout(plan: BillingPlan): Promise<string> {
  return checkoutUrlFrom('/api/billing/checkout', { plan });
}

export async function createBillingPortal(): Promise<string> {
  return checkoutUrlFrom('/api/billing/portal');
}

export async function requestAnnualRefund(): Promise<{ status: string; reason?: string | null }> {
  const { data } = await axios.post<{ status: string; reason?: string | null }>('/api/billing/refund-requests');
  return data;
}

export async function fetchReferrals(): Promise<ReferralStatus> {
  const { data } = await axios.get<ReferralStatus>('/api/billing/referrals');
  return data;
}
