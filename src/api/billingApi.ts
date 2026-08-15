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
