import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { fetchUserProfile } from '../api/userApi';
import { clearToken, isTokenValid } from '../auth';
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!isTokenValid()) {
      setProfile(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchUserProfile();
      setProfile(data);
    } catch (err) {
      setProfile(null);
      const status = axiosStatus(err);
      if (status === 401 || status === 403) {
        clearToken();
        setError('Session expired. Please sign in again.');
      } else {
        setError('Could not load your profile.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isTokenValid()) {
      void refreshProfile();
    } else {
      setProfile(null);
    }
  }, [refreshProfile]);

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
