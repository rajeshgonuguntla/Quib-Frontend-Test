export type StudioApiMode = 'mock' | 'live';

/** `VITE_STUDIO_API_MODE=mock` uses fixtures. Anything else, including unset, is live. */
export const STUDIO_API_MODE: StudioApiMode =
  import.meta.env.VITE_STUDIO_API_MODE === 'mock' ? 'mock' : 'live';
