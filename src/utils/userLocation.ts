/** Where the signed-in learner is, from the browser, then the network, then the time zone. */

export const USER_PLACE_KEY = 'cubit_user_place';

export type UserPlaceSource = 'browser' | 'network' | 'timezone';

export type UserPlace = {
  label: string;
  source: UserPlaceSource;
};

type PlaceResponse = {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
};

const PLACE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

let pending: Promise<UserPlace> | null = null;

export function readCachedUserPlace(): UserPlace | null {
  try {
    const raw = sessionStorage.getItem(USER_PLACE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserPlace;
    if (!parsed?.label || !parsed.source) return null;
    return parsed;
  } catch {
    return null;
  }
}

function rememberPlace(place: UserPlace): UserPlace {
  try {
    sessionStorage.setItem(USER_PLACE_KEY, JSON.stringify(place));
  } catch {
    /* ignore quota / private mode */
  }
  return place;
}

function placeLabel(parts: Array<string | undefined>): string {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const part of parts) {
    const text = part?.trim();
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(text);
  }
  return names.join(', ');
}

function timezonePlace(): UserPlace {
  let zone = 'this device';
  try {
    zone = Intl.DateTimeFormat().resolvedOptions().timeZone || zone;
  } catch {
    /* ignore */
  }
  return { label: zone.replace(/\//g, ', ').replace(/_/g, ' '), source: 'timezone' };
}

function readDeviceCoordinates(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is unavailable'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }),
      () => reject(new Error('Location was not allowed')),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60 * 1000 },
    );
  });
}

async function readPlace(coords?: { latitude: number; longitude: number }): Promise<string> {
  const url = new URL(PLACE_URL);
  url.searchParams.set('localityLanguage', 'en');
  if (coords) {
    url.searchParams.set('latitude', String(coords.latitude));
    url.searchParams.set('longitude', String(coords.longitude));
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error('Place lookup failed');
  const data = (await response.json()) as PlaceResponse;
  const label = placeLabel([data.city || data.locality, data.principalSubdivision, data.countryName]);
  if (!label) throw new Error('Place lookup was empty');
  return label;
}

async function lookupUserPlace(): Promise<UserPlace> {
  try {
    const coords = await readDeviceCoordinates();
    return rememberPlace({ label: await readPlace(coords), source: 'browser' });
  } catch {
    /* The person blocked the prompt, or this browser has no location. */
  }
  try {
    return rememberPlace({ label: await readPlace(), source: 'network' });
  } catch {
    return rememberPlace(timezonePlace());
  }
}

/** Ask the browser once, then fall back to the network and the time zone. */
export function resolveUserPlace(): Promise<UserPlace> {
  const cached = readCachedUserPlace();
  if (cached) return Promise.resolve(cached);
  if (!pending) {
    pending = lookupUserPlace().finally(() => {
      pending = null;
    });
  }
  return pending;
}
