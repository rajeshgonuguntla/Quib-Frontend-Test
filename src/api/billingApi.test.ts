import { describe, expect, it } from 'vitest';
import {
  billingPlanLabel,
  hasActiveComplimentary,
  hasPaidSubscription,
  hidesUpgradeCta,
  type BillingStatus,
} from './billingApi';

const base: BillingStatus = {
  hasUnlimited: false,
  trialCoursesUsed: 0,
  trialLimit: 3,
};

describe('billingPlanLabel', () => {
  it('labels admin without calling paid status', () => {
    expect(billingPlanLabel(base, true)).toBe('Admin');
  });

  it('labels trial as Free plan', () => {
    expect(billingPlanLabel({ ...base, hasUnlimited: true, trialCoursesUsed: 1 }, false)).toBe('Free plan');
  });

  it('labels paid annual', () => {
    expect(billingPlanLabel({ ...base, status: 'active', plan: 'annual' }, false)).toBe('Unlimited annual');
  });

  it('hides upgrade for past_due after first payment', () => {
    const me = { ...base, status: 'past_due', plan: 'monthly' };
    expect(hasPaidSubscription(me)).toBe(true);
    expect(hidesUpgradeCta(me)).toBe(true);
  });

  it('hides upgrade while complimentary is in the future', () => {
    const me = { ...base, complimentaryUntil: new Date(Date.now() + 86_400_000).toISOString() };
    expect(hasActiveComplimentary(me)).toBe(true);
    expect(hidesUpgradeCta(me)).toBe(true);
    expect(billingPlanLabel(me, false)).toBe('Unlimited');
  });
});
