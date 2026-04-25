import type { MarketPrice } from '@/types/meals';

const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

let _cache: { prices: MarketPrice[]; fetchedAt: number } | null = null;

/**
 * Stub prices based on typical Manila palengke / supermarket values (PHP).
 * Used as fallback when no live market API is configured.
 */
const STUB_PRICES: MarketPrice[] = [
  { ingredientId: 'rice', name: 'Rice', pricePerUnit: 55, unit: 'cup', market: 'Palengke PH', updatedAt: Date.now() },
  { ingredientId: 'chicken', name: 'Chicken', pricePerUnit: 200, unit: 'kg', market: 'Palengke PH', updatedAt: Date.now() },
  { ingredientId: 'pork-belly', name: 'Pork Belly', pricePerUnit: 320, unit: 'kg', market: 'Palengke PH', updatedAt: Date.now() },
  { ingredientId: 'pork-ground', name: 'Ground Pork', pricePerUnit: 280, unit: 'kg', market: 'Palengke PH', updatedAt: Date.now() },
  { ingredientId: 'egg', name: 'Egg', pricePerUnit: 9, unit: 'piece', market: 'Palengke PH', updatedAt: Date.now() },
  { ingredientId: 'bangus', name: 'Bangus (Milkfish)', pricePerUnit: 180, unit: 'kg', market: 'Palengke PH', updatedAt: Date.now() },
  { ingredientId: 'tilapia', name: 'Tilapia', pricePerUnit: 140, unit: 'kg', market: 'Palengke PH', updatedAt: Date.now() },
  { ingredientId: 'galunggong', name: 'Galunggong', pricePerUnit: 160, unit: 'kg', market: 'Palengke PH', updatedAt: Date.now() },
  { ingredientId: 'kangkong', name: 'Kangkong', pricePerUnit: 15, unit: 'bundle', market: 'Palengke PH', updatedAt: Date.now() },
  { ingredientId: 'malunggay', name: 'Malunggay Leaves', pricePerUnit: 10, unit: 'cup', market: 'Palengke PH', updatedAt: Date.now() },
  { ingredientId: 'sayote', name: 'Sayote', pricePerUnit: 25, unit: 'piece', market: 'Palengke PH', updatedAt: Date.now() },
  { ingredientId: 'sitaw', name: 'Sitaw (String Beans)', pricePerUnit: 20, unit: 'bundle', market: 'Palengke PH', updatedAt: Date.now() },
  { ingredientId: 'kamatis', name: 'Kamatis (Tomato)', pricePerUnit: 60, unit: 'kg', market: 'Palengke PH', updatedAt: Date.now() },
  { ingredientId: 'sibuyas', name: 'Sibuyas (Onion)', pricePerUnit: 80, unit: 'kg', market: 'Palengke PH', updatedAt: Date.now() },
  { ingredientId: 'bawang', name: 'Bawang (Garlic)', pricePerUnit: 120, unit: 'kg', market: 'Palengke PH', updatedAt: Date.now() },
  { ingredientId: 'ginger', name: 'Ginger', pricePerUnit: 15, unit: 'piece', market: 'Palengke PH', updatedAt: Date.now() },
  { ingredientId: 'sampalok', name: 'Sampalok Mix', pricePerUnit: 12, unit: 'pack', market: 'Palengke PH', updatedAt: Date.now() },
  { ingredientId: 'toyo', name: 'Soy Sauce', pricePerUnit: 15, unit: 'bottle', market: 'Palengke PH', updatedAt: Date.now() },
  { ingredientId: 'suka', name: 'Vinegar', pricePerUnit: 12, unit: 'bottle', market: 'Palengke PH', updatedAt: Date.now() },
  { ingredientId: 'calamansi', name: 'Calamansi', pricePerUnit: 5, unit: 'piece', market: 'Palengke PH', updatedAt: Date.now() },
  { ingredientId: 'coconut-milk', name: 'Coconut Milk', pricePerUnit: 35, unit: 'pack', market: 'Palengke PH', updatedAt: Date.now() },
  { ingredientId: 'cooking-oil', name: 'Cooking Oil', pricePerUnit: 45, unit: 'bottle', market: 'Palengke PH', updatedAt: Date.now() },
  { ingredientId: 'pandesal', name: 'Pandesal', pricePerUnit: 2, unit: 'piece', market: 'Palengke PH', updatedAt: Date.now() },
  { ingredientId: 'longganisa', name: 'Longganisa', pricePerUnit: 120, unit: 'pack', market: 'Palengke PH', updatedAt: Date.now() },
  { ingredientId: 'tuyo', name: 'Tuyo (Dried Fish)', pricePerUnit: 80, unit: 'pack', market: 'Palengke PH', updatedAt: Date.now() },
  { ingredientId: 'tofu', name: 'Tofu', pricePerUnit: 25, unit: 'block', market: 'Palengke PH', updatedAt: Date.now() },
];

const getMarketApiUrl = () => process.env.EXPO_PUBLIC_MARKET_API_URL ?? '';

/**
 * Fetches current market prices from the configured API.
 * Falls back to stub prices when no API is configured.
 * Results are cached for 1 hour.
 */
export async function fetchMarketPrices(): Promise<MarketPrice[]> {
  if (_cache && Date.now() - _cache.fetchedAt < CACHE_TTL_MS) {
    return _cache.prices;
  }

  const apiUrl = getMarketApiUrl();
  if (!apiUrl) {
    _cache = { prices: STUB_PRICES, fetchedAt: Date.now() };
    return STUB_PRICES;
  }

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Market API error: ${response.status}`);
    const data: MarketPrice[] = await response.json();
    _cache = { prices: data, fetchedAt: Date.now() };
    return data;
  } catch {
    // Fall back to stubs on API failure
    _cache = { prices: STUB_PRICES, fetchedAt: Date.now() };
    return STUB_PRICES;
  }
}

export function clearPriceCache(): void {
  _cache = null;
}

export function getStubPrices(): MarketPrice[] {
  return STUB_PRICES;
}
