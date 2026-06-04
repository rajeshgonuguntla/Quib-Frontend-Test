import type { UserProfile } from '../types/userProfile';

export function getDisplayName(profile: UserProfile | null | undefined): string {
  if (!profile) return 'Learner';
  const fromParts = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
  return (
    profile.certificateDisplayName?.trim() ||
    profile.displayName?.trim() ||
    fromParts ||
    profile.email?.split('@')[0] ||
    'Learner'
  );
}

export function getFirstName(profile: UserProfile | null | undefined): string {
  if (!profile) return 'there';
  if (profile.firstName?.trim()) return profile.firstName.trim();
  const display = profile.displayName?.trim();
  if (display) return display.split(/\s+/)[0] ?? 'there';
  const emailLocal = profile.email?.split('@')[0];
  if (emailLocal) return emailLocal;
  return 'there';
}

/** Google-style avatar palette — deterministic color from name/email */
const AVATAR_COLORS = [
  '#1E88E5',
  '#E53935',
  '#43A047',
  '#FB8C00',
  '#8E24AA',
  '#00ACC1',
  '#6D4C41',
  '#5C6BC0',
  '#00897B',
  '#C2185B',
];

export function getAvatarBackgroundColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/** Single letter for avatar fallback (first character of display name) */
export function getAvatarLetter(profile: UserProfile | null | undefined): string {
  const name = getDisplayName(profile);
  const letter = name.trim().charAt(0);
  return letter ? letter.toUpperCase() : '?';
}

export function getAvatarColorSeed(profile: UserProfile | null | undefined): string {
  return getDisplayName(profile) || profile?.email || 'user';
}

export function getInitials(profile: UserProfile | null | undefined): string {
  const name = getDisplayName(profile);
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  if (parts.length === 1 && parts[0].length > 0) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return '?';
}

export function getCertificateRecipientName(profile: UserProfile | null | undefined): string {
  if (!profile) return 'Learner';
  return profile.certificateDisplayName?.trim() || getDisplayName(profile);
}
