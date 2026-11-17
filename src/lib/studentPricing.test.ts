import { describe, expect, it } from 'vitest';
import {
  STUDENT_ADDONS,
  STUDENT_FREE_FEATURES,
  STUDENT_PRO_FEATURES,
  STUDENT_SPRINT_FEATURES,
  studentCheckoutPlan,
} from './studentPricing';

describe('studentPricing', () => {
  it('exposes Free, Pro, Sprint, and add-on copy', () => {
    expect(STUDENT_FREE_FEATURES.length).toBeGreaterThan(0);
    expect(STUDENT_PRO_FEATURES.length).toBeGreaterThan(0);
    expect(STUDENT_SPRINT_FEATURES.length).toBeGreaterThan(0);
    expect(STUDENT_ADDONS).toHaveLength(3);
  });

  it('maps only monthly and annual to Stripe checkout', () => {
    expect(studentCheckoutPlan('monthly')).toBe('monthly');
    expect(studentCheckoutPlan('annual')).toBe('annual');
    expect(studentCheckoutPlan('quarterly')).toBeNull();
    expect(studentCheckoutPlan('sprint')).toBeNull();
  });
});
