import { afterEach, describe, expect, it, vi } from 'vitest';
import { USER_PLACE_KEY, resolveUserPlace } from './userLocation';

function placeResponse(city: string) {
  return {
    ok: true,
    json: async () => ({ city, principalSubdivision: 'Texas', countryName: 'United States' }),
  };
}

describe('resolveUserPlace', () => {
  afterEach(() => {
    sessionStorage.removeItem(USER_PLACE_KEY);
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('uses the browser location when it is allowed', async () => {
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: (success: PositionCallback) => {
          success({ coords: { latitude: 30.27, longitude: -97.74 } } as GeolocationPosition);
        },
      },
    });
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      expect(String(input)).toContain('latitude=30.27');
      return placeResponse('Austin');
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(resolveUserPlace()).resolves.toEqual({
      label: 'Austin, Texas, United States',
      source: 'browser',
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('uses the network place when the browser location is blocked', async () => {
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: (_success: PositionCallback, failure: PositionErrorCallback) => {
          failure({ code: 1 } as GeolocationPositionError);
        },
      },
    });
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      expect(String(input)).not.toContain('latitude=');
      return placeResponse('Dallas');
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(resolveUserPlace()).resolves.toEqual({
      label: 'Dallas, Texas, United States',
      source: 'network',
    });
  });

  it('uses the time zone when the browser and the network both fail', async () => {
    vi.stubGlobal('navigator', { geolocation: undefined });
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
    vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
      timeZone: 'America/Chicago',
    } as Intl.ResolvedDateTimeFormatOptions);

    await expect(resolveUserPlace()).resolves.toEqual({
      label: 'America, Chicago',
      source: 'timezone',
    });
  });

  it('reads a saved place without asking again', async () => {
    sessionStorage.setItem(USER_PLACE_KEY, JSON.stringify({ label: 'Austin, Texas', source: 'browser' }));
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(resolveUserPlace()).resolves.toEqual({ label: 'Austin, Texas', source: 'browser' });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
