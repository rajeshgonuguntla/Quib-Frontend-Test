import { useState } from 'react';
import type { UserProfile } from '../types/userProfile';
import { getAvatarBackgroundColor, getAvatarColorSeed, getAvatarLetter } from '../utils/userDisplay';

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
};

export function UserAvatar({ profile, size = 'md', className = '', style }: UserAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const avatarUrl = profile?.avatarUrl?.trim();
  const showFallback = !avatarUrl || imgFailed;
  const letter = getAvatarLetter(profile);
  const bg = getAvatarBackgroundColor(getAvatarColorSeed(profile));
  const s = SIZES[size];

  if (showFallback) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${s.box} ${s.text} ${className}`}
        style={{ background: bg, ...style }}
        aria-hidden
      >
        {letter}
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt=""
      className={`shrink-0 rounded-full object-cover ${s.box} ${className}`}
      style={style}
      onError={() => setImgFailed(true)}
    />
  );
}
