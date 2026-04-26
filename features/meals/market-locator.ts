const ANOMURA_SEARCH = 'https://api.anomura.today/api/markets/search';
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours
const DEFAULT_MARKET = { id: 500, name: 'Blumentritt Market' } as const;

interface AnomuranMarket {
  id: number;
  name: string;
  region_name: string;
  region_code: string;
}

interface SearchResponse {
  query: string;
  region: string;
  count: number;
  markets: AnomuranMarket[];
}

let _cached: { market: { id: number; name: string }; resolvedAt: number } | null = null;

/**
 * Dynamically imports expo-location so the module doesn't crash
 * if the package isn't installed yet.
 */
async function getLocation(): Promise<typeof import('expo-location') | null> {
  try {
    return await import('expo-location');
  } catch {
    return null;
  }
}

/**
 * Resolves the nearest wet market using the device's location.
 * Falls back to Blumentritt Market (ID 500) if location is unavailable
 * or no markets are found.
 */
export async function resolveNearestMarket(): Promise<{ id: number; name: string }> {
  // Return cached result if still fresh
  if (_cached && Date.now() - _cached.resolvedAt < CACHE_TTL_MS) {
    return _cached.market;
  }

  try {
    const Location = await getLocation();
    if (!Location) {
      return cacheAndReturn(DEFAULT_MARKET);
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return cacheAndReturn(DEFAULT_MARKET);
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const [geo] = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    if (!geo) {
      return cacheAndReturn(DEFAULT_MARKET);
    }

    // Try city first, then region/subregion
    const searchTerms = [geo.city, geo.subregion, geo.region].filter(Boolean) as string[];

    for (const term of searchTerms) {
      const market = await searchMarket(term);
      if (market) return cacheAndReturn(market);
    }

    return cacheAndReturn(DEFAULT_MARKET);
  } catch {
    return cacheAndReturn(DEFAULT_MARKET);
  }
}

async function searchMarket(query: string): Promise<{ id: number; name: string } | null> {
  try {
    const res = await fetch(`${ANOMURA_SEARCH}?q=${encodeURIComponent(query)}`);
    if (!res.ok) return null;

    const data: SearchResponse = await res.json();
    if (data.markets.length === 0) return null;

    const best = data.markets[0];
    return { id: best.id, name: best.name };
  } catch {
    return null;
  }
}

function cacheAndReturn(market: { id: number; name: string }): { id: number; name: string } {
  _cached = { market, resolvedAt: Date.now() };
  return market;
}
