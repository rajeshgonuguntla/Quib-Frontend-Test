/** Shared Student pricing copy — landing + signed-in Upgrade. */

export const STUDENT_FREE_FEATURES = [
  'Limited daily practice questions',
  'Saved explanations',
  '3 tutor chats a week',
  'Basic progress view',
] as const;

export const STUDENT_PRO_FEATURES = [
  'Unlimited practice questions',
  'A daily study plan',
  'A weekly parent progress report',
  'The full personal tutor',
  'The mistake notebook + Cubit Notes',
] as const;

export const STUDENT_SPRINT_FEATURES = [
  'Full Pro for 90 days',
  'No subscription',
  'Built around a test date',
  'Target your weak areas',
  'Build on your strengths',
  'Track your practice',
] as const;

export const STUDENT_ADDONS = [
  { title: 'GRE essay feedback pack', price: '₹299 for 10 essays' },
  { title: 'Extra mock test with analysis', price: '₹199 each' },
  { title: 'Sibling or friend discount', price: '20% off' },
] as const;

export type StudentCheckoutPlan = 'monthly' | 'annual';

/** Plans that map to existing Stripe Unlimited checkout. */
export function studentCheckoutPlan(id: string): StudentCheckoutPlan | null {
  if (id === 'monthly' || id === 'annual') return id;
  return null;
}
