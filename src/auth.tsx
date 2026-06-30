import { Navigate, Outlet, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import { useUserProfile } from './context/UserProfileContext';
import { INTERESTS_KEY } from './components/Onboarding';

const TOKEN_KEY = 'token';
const AUTH_CHANGED_EVENT = 'quib-auth-changed';

type JwtPayload = {
  exp?: number;
};

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** Fires when login/logout changes the stored token (fresh chat sessions). */
export function notifyAuthChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
}

/** Changes on login, logout, or token swap — use as React key to reset ephemeral UI state. */
export function useAuthSessionKey(): string {
  const read = () => localStorage.getItem(TOKEN_KEY) ?? 'guest';
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

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
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
  const token = getToken();
  if (!token) {
    return false;
  }

  const payload = parseJwtPayload(token);
  if (!payload) {
    return false;
  }

  // Require exp to exist and be in the future for protected pages.
  if (typeof payload.exp !== 'number') {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) {
    return false;
  }

  return true;
}

export function ProtectedRoute() {
  const location = useLocation();

  if (!isTokenValid()) {
    clearToken();
    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/signin" replace state={{ returnTo }} />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { loading } = useUserProfile();

  if (!isTokenValid()) {
    return <Outlet />;
  }

  if (loading) {
    return null;
  }

  const hasInterests = !!localStorage.getItem(INTERESTS_KEY);
  return <Navigate to={hasInterests ? '/dashboard' : '/onboarding'} replace />;
}