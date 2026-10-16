import { Navigate, Outlet, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import { useUserProfile } from './context/UserProfileContext';
import { INTERESTS_KEY } from './components/Onboarding';
import { safeAppPath } from './utils/safeAppPath';

const TOKEN_KEY = 'token';
const SESSION_EXP_KEY = 'cuib_session_exp';
const AUTH_CHANGED_EVENT = 'quib-auth-changed';

// Drop legacy Bearer JWT from dual-auth era (XSS-readable).
if (typeof localStorage !== 'undefined') {
  localStorage.removeItem(TOKEN_KEY);
}

/** Fires when login/logout changes the stored session (fresh chat sessions). */
export function notifyAuthChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
}

/** Changes on login, logout, or session swap — use as React key to reset ephemeral UI state. */
export function useAuthSessionKey(): string {
  const read = () => localStorage.getItem(SESSION_EXP_KEY) ?? 'guest';
  const [sessionKey, setSessionKey] = useState(read);

  useEffect(() => {
    const sync = () => setSessionKey(read());
    window.addEventListener(AUTH_CHANGED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return sessionKey;
}

/** Drop JS session flags. Does not wait on the logout request (avoids racing a new login cookie). */
export function clearLocalSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_EXP_KEY);
  notifyAuthChanged();
}

export function clearToken(): void {
  clearLocalSession();
  void import('axios').then(({ default: axios }) =>
    axios.post('/api/auth/logout').catch(() => undefined),
  );
}

/** Persist session expiry flag only. Auth is the HttpOnly cuib_at cookie (same-origin). */
export function setSession(expiresAtEpochSeconds: number): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.setItem(SESSION_EXP_KEY, String(expiresAtEpochSeconds));
  notifyAuthChanged();
}

function sessionExp(): number | null {
  const raw = localStorage.getItem(SESSION_EXP_KEY);
  if (!raw) return null;
  const exp = Number(raw);
  return Number.isFinite(exp) ? exp : null;
}

export function isTokenValid(): boolean {
  const exp = sessionExp();
  if (exp == null) {
    return false;
  }
  return exp > Math.floor(Date.now() / 1000);
}

export function ProtectedRoute() {
  const location = useLocation();

  if (!isTokenValid()) {
    clearToken();
    const returnTo = safeAppPath(`${location.pathname}${location.search}${location.hash}`);
    return <Navigate to="/signin" replace state={returnTo ? { returnTo } : undefined} />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { loading } = useUserProfile();

  if (!isTokenValid()) {
    return <Outlet />;
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  const hasInterests = !!localStorage.getItem(INTERESTS_KEY);
  return <Navigate to={hasInterests ? '/dashboard' : '/onboarding'} replace />;
}
