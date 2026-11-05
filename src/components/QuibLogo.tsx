import { BRAND_NAME } from '../brand';
import { CUBIT_LOGO } from '../cubit/subjects';
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

/** Cubit mark — orange cube asset used across signed-in chrome. */
export function QuibLogoMark({ size = 20, className }: QuibLogoMarkProps) {
  return (
    <img
      src={CUBIT_LOGO}
      alt="Cubit"
      width={size}
      height={size}
      className={cn('object-contain', className)}
    />
  );
}

/** App badge / favicon-style mark. */
export function QuibLogoBadge({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
  variant?: LogoVariant;
}) {
  return (
    <img
      src={CUBIT_LOGO}
      alt={BRAND_NAME}
      width={size}
      height={size}
      className={cn('rounded-md object-contain', className)}
    />
  );
}

/** Cubit mark with optional wordmark — default branding lockup. */
export function QuibLogo({
  showWordmark = true,
  wordmark = BRAND_NAME,
  size = 20,
  className,
  wordmarkClassName,
}: QuibLogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <QuibLogoMark size={size} />
      {showWordmark ? (
        <span className={cn('font-semibold tracking-tight', wordmarkClassName)}>{wordmark}</span>
      ) : null}
    </span>
  );
}
