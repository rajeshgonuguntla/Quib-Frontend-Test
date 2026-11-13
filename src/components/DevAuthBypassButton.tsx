import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useUserProfile } from '../context/UserProfileContext';
import { isAuthDevBypassEnabled } from '../utils/authDevBypass';
import {
  completeDevBypassSignIn,
  takeLearnerStartState,
  type LearnerStartState,
} from '../utils/completeGoogleSignIn';

type DevAuthBypassButtonProps = {
  signInIntent?: 'creator' | 'student';
  onLoginBlocked?: (message: string | null) => void;
  className?: string;
};

/** Visible only in Vite DEV. Frontend-only session — no backend auth call. */
export function DevAuthBypassButton({
  signInIntent = 'student',
  onLoginBlocked,
  className,
}: DevAuthBypassButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setProfile } = useUserProfile();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthDevBypassEnabled()) return null;

  const handleClick = async () => {
    setBusy(true);
    onLoginBlocked?.(null);
    setError(null);

    const stashed = takeLearnerStartState();
    const locationState = (location.state as LearnerStartState | null) ?? null;
    const result = await completeDevBypassSignIn({
      navigate,
      setProfile,
      signInIntent,
      pendingState: { ...(locationState ?? {}), ...(stashed ?? {}) },
      onBlocked: (message) => {
        if (onLoginBlocked) onLoginBlocked(message);
        else setError(message);
      },
    });

    if (!result.ok && !onLoginBlocked) {
      setError(result.error);
    }
    setBusy(false);
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={busy}
        className="w-full rounded-full border border-dashed border-[var(--border,#eaeaea)] bg-transparent px-4 py-2.5 text-[12.5px] font-semibold text-[var(--ink-soft,#6e6e6e)] transition-colors hover:border-[var(--ink-faint,#a3a3a3)] hover:text-[var(--ink,#0a0a0a)] disabled:opacity-60"
      >
        {busy ? 'Signing in locally…' : 'Continue without Google (local)'}
      </button>
      {error ? (
        <p className="mt-2 text-center text-[11px] text-[var(--accent,#e8650a)]" role="alert">
          {error}
        </p>
      ) : (
        <p className="mt-1.5 text-center font-mono text-[10px] text-[var(--ink-faint,#a3a3a3)]">
          Dev only · frontend session (no Google / no backend auth)
        </p>
      )}
    </div>
  );
}
