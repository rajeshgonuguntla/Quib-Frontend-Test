import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { cn } from './ui/utils';

type ThemeToggleProps = {
  size?: 'sm' | 'md';
  className?: string;
};

export function ThemeToggle({ size = 'md', className = '' }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();
  const iconSize = size === 'sm' ? 14 : 16;
  const buttonSize = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        buttonSize,
        'inline-flex items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
        className,
      )}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun size={iconSize} /> : <Moon size={iconSize} />}
    </button>
  );
}
