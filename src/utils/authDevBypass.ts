const DEV_BYPASS_KEY = 'cuib_dev_bypass';
const DEV_BYPASS_PROFILE_KEY = 'cuib_dev_bypass_profile';

/** Local Vite only — never ship a visible bypass in production builds. */
export function isAuthDevBypassEnabled(): boolean {
  if (!import.meta.env.DEV) return false;
  // Opt out with VITE_AUTH_DEV_BYPASS=false; default on in local `vite` runs.
  return import.meta.env.VITE_AUTH_DEV_BYPASS !== 'false';
}

export function isLocalDevBypassSession(): boolean {
  return isAuthDevBypassEnabled() && localStorage.getItem(DEV_BYPASS_KEY) === '1';
}

export type LocalDevBypassProfile = {
  id: string;
  email: string;
  displayName: string;
  firstName: string;
  role: 'learner';
};

export const LOCAL_DEV_BYPASS_PROFILE: LocalDevBypassProfile = {
  id: 'local-dev-bypass',
  email: 'local.dev@cubit.local',
  displayName: 'Local Tester',
  firstName: 'Local',
  role: 'learner',
};

export function markLocalDevBypassSession(profile: LocalDevBypassProfile = LOCAL_DEV_BYPASS_PROFILE): void {
  localStorage.setItem(DEV_BYPASS_KEY, '1');
  localStorage.setItem(DEV_BYPASS_PROFILE_KEY, JSON.stringify(profile));
}

export function readLocalDevBypassProfile(): LocalDevBypassProfile | null {
  if (!isLocalDevBypassSession()) return null;
  try {
    const raw = localStorage.getItem(DEV_BYPASS_PROFILE_KEY);
    if (!raw) return LOCAL_DEV_BYPASS_PROFILE;
    return { ...LOCAL_DEV_BYPASS_PROFILE, ...(JSON.parse(raw) as Partial<LocalDevBypassProfile>) };
  } catch {
    return LOCAL_DEV_BYPASS_PROFILE;
  }
}

export function clearLocalDevBypassSession(): void {
  localStorage.removeItem(DEV_BYPASS_KEY);
  localStorage.removeItem(DEV_BYPASS_PROFILE_KEY);
}
