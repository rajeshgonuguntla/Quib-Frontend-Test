import { Navigate, Outlet, useLocation } from 'react-router';

const TOKEN_KEY = 'token';

type JwtPayload = {
  exp?: number;
};

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
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
  if (isTokenValid()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}