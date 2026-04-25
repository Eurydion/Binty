import type { MarketPrice } from '@/types/meals';

const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

let _cache: { prices: MarketPrice[]; fetchedAt: number } | null = null;

/**
 * Fetches current market prices from the configured API.
 * Results are cached for 1 hour to avoid excessive requests.
 */
export async function fetchMarketPrices(): Promise<MarketPrice[]> {
  if (_cache && Date.now() - _cache.fetchedAt < CACHE_TTL_MS) {
    return _cache.prices;
  }

  // TODO: replace with real market price API endpoint
  const response = await fetch('https://api.example.com/market-prices');
  if (!response.ok) throw new Error(`Market API error: ${response.status}`);

  const data: MarketPrice[] = await response.json();
  _cache = { prices: data, fetchedAt: Date.now() };
  return data;
}

export function clearPriceCache(): void {
  _cache = null;
}
