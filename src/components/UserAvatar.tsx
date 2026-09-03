import { useEffect, useState } from 'react';
import type { UserProfile } from '../types/userProfile';
import { getAvatarBackgroundColor, getAvatarColorSeed, getAvatarLetter, getInitials } from '../utils/userDisplay';

const SIZES = {
  sm: { box: 'h-7 w-7', text: 'text-[0.7rem]' },
  md: { box: 'h-8 w-8', text: 'text-xs' },
  lg: { box: 'h-20 w-20', text: 'text-2xl' },
} as const;

type UserAvatarProps = {
  profile: UserProfile | null | undefined;
  size?: keyof typeof SIZES;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'default' | 'mono';
};

export function UserAvatar({ profile, size = 'md', className = '', style, variant = 'default' }: UserAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const avatarUrl = profile?.avatarUrl?.trim();
  const showFallback = !avatarUrl || imgFailed;
  const letter = getAvatarLetter(profile);
  const bg = getAvatarBackgroundColor(getAvatarColorSeed(profile));
  const s = SIZES[size];

  useEffect(() => {
    setImgFailed(false);
  }, [avatarUrl]);

  const photo = (
    <img
      src={avatarUrl}
      alt=""
      referrerPolicy="no-referrer"
      className={`shrink-0 rounded-full object-cover ${s.box} ${className}`}
      style={style}
      onError={() => setImgFailed(true)}
    />
  );

  if (variant === 'mono') {
    if (showFallback) {
      return (
        <div
          className={`flex shrink-0 items-center justify-center rounded-full ${s.box} ${className}`}
          style={{
            fontFamily: 'IBM Plex Mono, ui-monospace, monospace',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--ink-soft)',
            background: 'var(--fill)',
            ...style,
          }}
          aria-hidden
        >
          {getInitials(profile)}
        </div>
      );
    }
    return photo;
  }

  if (showFallback) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${s.box} ${s.text} ${className} ${profile ? '' : 'bg-muted'}`}
        style={profile ? { background: bg, ...style } : style}
        aria-hidden
      >
        {letter}
      </div>
    );
  }

  return photo;
}
