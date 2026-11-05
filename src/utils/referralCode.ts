const KEY = 'quib.referralCode';

export function rememberReferralCode(code: string | null | undefined): void {
  const trimmed = code?.trim();
  if (!trimmed) return;
  sessionStorage.setItem(KEY, trimmed.toUpperCase());
}

export function peekReferralCode(): string | undefined {
  return sessionStorage.getItem(KEY) || undefined;
}
