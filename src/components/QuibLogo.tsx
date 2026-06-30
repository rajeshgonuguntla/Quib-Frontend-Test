import { useTheme } from './ThemeContext';
import { cn } from './ui/utils';

type LogoVariant = 'auto' | 'dark' | 'light';

type QuibLogoMarkProps = {
  size?: number;
  className?: string;
  variant?: LogoVariant;
};

type QuibLogoProps = {
  showWordmark?: boolean;
  wordmark?: string;
  size?: number;
  className?: string;
  wordmarkClassName?: string;
  variant?: LogoVariant;
};

function resolveDark(variant: LogoVariant, isDark: boolean): boolean {
  if (variant === 'dark') return true;
  if (variant === 'light') return false;
  return isDark;
}

function cubeColors(dark: boolean) {
  return dark
    ? { top: '#2a2a2a', left: '#0e0e0e', right: '#1a1a1a', stroke: '#ffffff' }
    : { top: '#ffffff', left: '#c8c8c8', right: '#e4e4e4', stroke: '#333333' };
}

/** Cube mark only — scales cleanly in nav bars and compact headers. */
export function QuibLogoMark({ size = 20, className, variant = 'auto' }: QuibLogoMarkProps) {
  const { isDark } = useTheme();
  const dark = resolveDark(variant, isDark);
  const c = cubeColors(dark);

  return (
    <svg
      viewBox="80 100 240 237"
      width={size}
      height={size}
      className={className}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Quib</title>
      <g transform="translate(200,200)">
        <polygon points="0,-100 120,-42 0,17 -120,-42" fill={c.top} />
        <polygon points="-120,-42 0,17 0,137 -120,78" fill={c.left} />
        <polygon points="120,-42 0,17 0,137 120,78" fill={c.right} />
        <polygon
          points="0,-100 120,-42 0,17 -120,-42"
          fill="none"
          stroke={c.stroke}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <polygon
          points="-120,-42 0,17 0,137 -120,78"
          fill="none"
          stroke={c.stroke}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <polygon
          points="120,-42 0,17 0,137 120,78"
          fill="none"
          stroke={c.stroke}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <line x1="0" y1="17" x2="0" y2="137" stroke={c.stroke} strokeWidth="1.5" />
      </g>
    </svg>
  );
}

/** Full square logo asset from files.zip — good for favicons and app badges. */
export function QuibLogoBadge({
  size = 28,
  className,
  variant = 'auto',
}: {
  size?: number;
  className?: string;
  variant?: LogoVariant;
}) {
  const { isDark } = useTheme();
  const dark = resolveDark(variant, isDark);
  const src = dark ? '/cube_logo_dark.svg' : '/cube_logo_light.svg';

  return (
    <img
      src={src}
      alt="Quib"
      width={size}
      height={size}
      className={cn('rounded-md object-contain', className)}
    />
  );
}

/** Cube mark with optional wordmark — default branding lockup. */
export function QuibLogo({
  showWordmark = true,
  wordmark = 'Quib',
  size = 20,
  className,
  wordmarkClassName,
  variant = 'auto',
}: QuibLogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <QuibLogoMark size={size} variant={variant} />
      {showWordmark ? (
        <span className={cn('font-semibold tracking-tight', wordmarkClassName)}>{wordmark}</span>
      ) : null}
    </span>
  );
}
