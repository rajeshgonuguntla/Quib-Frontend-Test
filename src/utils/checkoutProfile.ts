import type { UserProfile } from '../types/userProfile';

const EMAIL_RE = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export function normalizePhoneDigits(raw: string): string | null {
  let digits = raw.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.slice(1);
  }
  if (digits.length < 10 || digits.length > 15) {
    return null;
  }
  return digits;
}

export function isCheckoutProfileReady(profile: UserProfile | null | undefined): boolean {
  if (!profile?.email?.trim() || !EMAIL_RE.test(profile.email.trim())) {
    return false;
  }
  return normalizePhoneDigits(profile.mobilePhone ?? '') !== null;
}
