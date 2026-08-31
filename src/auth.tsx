import { Navigate, Outlet, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import { useUserProfile } from './context/UserProfileContext';
import { INTERESTS_KEY } from './components/Onboarding';
import { safeAppPath } from './utils/safeAppPath';

const TOKEN_KEY = 'token';
const SESSION_EXP_KEY = 'cuib_session_exp';
const AUTH_CHANGED_EVENT = 'quib-auth-changed';

type JwtPayload = {
  exp?: number;
};

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function sessionExp(): number | null {
  const raw = localStorage.getItem(SESSION_EXP_KEY);
  if (!raw) return null;
  const exp = Number(raw);
  return Number.isFinite(exp) ? exp : null;
}

/** Fires when login/logout changes the stored token (fresh chat sessions). */
export function notifyAuthChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
}

/** Changes on login, logout, or token swap — use as React key to reset ephemeral UI state. */
export function useAuthSessionKey(): string {
  const read = () =>
    localStorage.getItem(SESSION_EXP_KEY)
    ?? localStorage.getItem(TOKEN_KEY)
    ?? 'guest';
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

export function setSession(expiresAtEpochSeconds: number): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.setItem(SESSION_EXP_KEY, String(expiresAtEpochSeconds));
  notifyAuthChanged();
}

function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payloadBase64 = parts[1];
    if (!payloadBase64) {
      return null;
    }

    const normalized = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '==='.slice((normalized.length + 3) % 4);
    const payloadJson = atob(padded);

    return JSON.parse(payloadJson) as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenValid(): boolean {
  const exp = sessionExp();
  const now = Math.floor(Date.now() / 1000);
  if (exp != null) {
    return exp > now;
  }

  const token = getToken();
  if (!token) {
    return false;
  }

  const payload = parseJwtPayload(token);
  if (!payload) {
    return false;
  }

  if (typeof payload.exp !== 'number') {
    return false;
  }

  return payload.exp > now;
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
