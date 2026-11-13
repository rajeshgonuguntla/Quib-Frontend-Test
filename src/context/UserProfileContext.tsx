import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { fetchUserProfile } from '../api/userApi';
import { clearToken, isTokenValid, useAuthSessionKey } from '../auth';
import type { UserProfile } from '../types/userProfile';

type UserProfileContextValue = {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  setProfile: (profile: UserProfile | null) => void;
};

const UserProfileContext = createContext<UserProfileContextValue | null>(null);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const sessionKey = useAuthSessionKey();
  const requestSeq = useRef(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(() => isTokenValid());
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    const seq = ++requestSeq.current;
    if (!isTokenValid()) {
      if (seq === requestSeq.current) {
        setProfile(null);
        setError(null);
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchProfileWithRetry();
      if (seq !== requestSeq.current) {
        return;
      }
      setProfile(data);
    } catch (err) {
      if (seq !== requestSeq.current) {
        return;
      }
      const status = axiosStatus(err);
      if (status === 401 || status === 403) {
        setProfile(null);
        clearToken();
        setError('Session expired. Please sign in again.');
      } else {
        setError('Could not load your profile.');
      }
    } finally {
      if (seq === requestSeq.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    requestSeq.current += 1;
    if (isTokenValid()) {
      void refreshProfile();
    } else {
      setProfile(null);
      setError(null);
      setLoading(false);
    }
  }, [sessionKey, refreshProfile]);

  const value = useMemo(
    () => ({ profile, loading, error, refreshProfile, setProfile }),
    [profile, loading, error, refreshProfile],
  );

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext);
  if (!ctx) {
    throw new Error('useUserProfile must be used within UserProfileProvider');
  }
  return ctx;
}

function axiosStatus(err: unknown): number | undefined {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { status?: number } }).response;
    return response?.status;
  }
  return undefined;
}

async function fetchProfileWithRetry(): Promise<UserProfile> {
  let last: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await fetchUserProfile();
    } catch (err) {
      last = err;
      const status = axiosStatus(err);
      if (status === 400 || status === 401 || status === 403 || status === 404) {
        throw err;
      }
      if (attempt === 2) {
        throw err;
      }
      await new Promise((resolve) => {
        window.setTimeout(resolve, 400 * (attempt + 1));
      });
    }
  }
  throw last;
}
