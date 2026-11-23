export type StudioApiMode = 'mock' | 'live';

/** Build flag for the Cubit Studio / My courses experience. Off leaves today's app unchanged. */
export const STUDIO_V2_ENABLED = import.meta.env.VITE_STUDIO_V2 === 'true';

/** `VITE_STUDIO_API_MODE=mock` uses fixtures. Anything else, including unset, is live. */
export const STUDIO_API_MODE: StudioApiMode =
  import.meta.env.VITE_STUDIO_API_MODE === 'mock' ? 'mock' : 'live';
