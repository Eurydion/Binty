import type { MarketPrice } from '@/types/meals';

const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour
const BLUMENTRITT_API = 'https://api.anomura.today/api/markets/500/dashboard';

let _cache: { prices: MarketPrice[]; fetchedAt: number } | null = null;

/**
 * Maps Blumentritt Market API item names → our ingredient IDs.
 * Only items we can confidently map are included.
 */
const API_NAME_TO_ID: Record<string, { id: string; name: string; unit: string }> = {
  'COMMERCIAL (LOCAL) Premium (Yellow tagged)': { id: 'rice', name: 'Rice', unit: 'kg' },
  'Pork Belly (Liempo)': { id: 'pork-belly', name: 'Pork Belly', unit: 'kg' },
  'Pork Ham (Kasim)': { id: 'pork-ground', name: 'Ground Pork', unit: 'kg' },
  'Garlic(Imported)': { id: 'bawang', name: 'Bawang (Garlic)', unit: 'kg' },
  'Ginger': { id: 'ginger', name: 'Ginger', unit: 'kg' },
  'Red Onion': { id: 'sibuyas', name: 'Sibuyas (Onion)', unit: 'kg' },
  'Tomato': { id: 'kamatis', name: 'Kamatis (Tomato)', unit: 'kg' },
  'Sitao': { id: 'sitaw', name: 'Sitaw (String Beans)', unit: 'kg' },
  'Chayote': { id: 'sayote', name: 'Sayote', unit: 'kg' },
  'Squash': { id: 'kalabasa', name: 'Kalabasa (Squash)', unit: 'kg' },
  'Eggplant': { id: 'talong', name: 'Talong (Eggplant)', unit: 'kg' },
  'Calamansi': { id: 'calamansi', name: 'Calamansi', unit: 'kg' },
  'Cooking Oil Palm 1L': { id: 'cooking-oil', name: 'Cooking Oil', unit: 'L' },
  'Sugar (Brown)': { id: 'sugar', name: 'Brown Sugar', unit: 'kg' },
  'Ampalaya': { id: 'ampalaya', name: 'Ampalaya (Bitter Gourd)', unit: 'kg' },
  'Cabbage (Scorpio)': { id: 'cabbage', name: 'Cabbage', unit: 'kg' },
  'Pechay (Native)': { id: 'pechay', name: 'Pechay', unit: 'kg' },
};

/**
 * Fallback prices for ingredients NOT available in the Blumentritt Market API.
 * These cover proteins, condiments, and specialty items.
 */
const OFFLINE_PRICES: MarketPrice[] = [
  { ingredientId: 'chicken', name: 'Chicken', pricePerUnit: 200, unit: 'kg', market: 'Estimate', updatedAt: Date.now() },
  { ingredientId: 'egg', name: 'Egg', pricePerUnit: 9, unit: 'piece', market: 'Estimate', updatedAt: Date.now() },
  { ingredientId: 'bangus', name: 'Bangus (Milkfish)', pricePerUnit: 180, unit: 'kg', market: 'Estimate', updatedAt: Date.now() },
  { ingredientId: 'tilapia', name: 'Tilapia', pricePerUnit: 140, unit: 'kg', market: 'Estimate', updatedAt: Date.now() },
  { ingredientId: 'galunggong', name: 'Galunggong', pricePerUnit: 160, unit: 'kg', market: 'Estimate', updatedAt: Date.now() },
  { ingredientId: 'kangkong', name: 'Kangkong', pricePerUnit: 40, unit: 'kg', market: 'Estimate', updatedAt: Date.now() },
  { ingredientId: 'malunggay', name: 'Malunggay Leaves', pricePerUnit: 60, unit: 'kg', market: 'Estimate', updatedAt: Date.now() },
  { ingredientId: 'sampalok', name: 'Sampalok Mix', pricePerUnit: 12, unit: 'pack', market: 'Estimate', updatedAt: Date.now() },
  { ingredientId: 'toyo', name: 'Soy Sauce', pricePerUnit: 15, unit: 'bottle', market: 'Estimate', updatedAt: Date.now() },
  { ingredientId: 'suka', name: 'Vinegar', pricePerUnit: 12, unit: 'bottle', market: 'Estimate', updatedAt: Date.now() },
  { ingredientId: 'coconut-milk', name: 'Coconut Milk', pricePerUnit: 35, unit: 'pack', market: 'Estimate', updatedAt: Date.now() },
  { ingredientId: 'pandesal', name: 'Pandesal', pricePerUnit: 3, unit: 'piece', market: 'Estimate', updatedAt: Date.now() },
  { ingredientId: 'longganisa', name: 'Longganisa', pricePerUnit: 120, unit: 'pack', market: 'Estimate', updatedAt: Date.now() },
  { ingredientId: 'tuyo', name: 'Tuyo (Dried Fish)', pricePerUnit: 80, unit: 'pack', market: 'Estimate', updatedAt: Date.now() },
  { ingredientId: 'tofu', name: 'Tofu', pricePerUnit: 25, unit: 'block', market: 'Estimate', updatedAt: Date.now() },
];

interface BlumentrittDashboard {
  market: { id: number; name: string };
  latestDate: string;
  periods: {
    '7d': {
      items: Array<{ name: string; price: number; unit: string }>;
    };
  };
}

/**
 * Converts the Blumentritt Market API response into our MarketPrice[] format.
 */
function parseBlumentrittResponse(data: BlumentrittDashboard): MarketPrice[] {
  const marketName = data.market.name;
  const now = Date.now();
  const livePrices: MarketPrice[] = [];
  const seenIds = new Set<string>();

  for (const item of data.periods['7d'].items) {
    const mapping = API_NAME_TO_ID[item.name];
    if (!mapping || seenIds.has(mapping.id)) continue;
    seenIds.add(mapping.id);
    livePrices.push({
      ingredientId: mapping.id,
      name: mapping.name,
      pricePerUnit: item.price,
      unit: mapping.unit,
      market: marketName,
      updatedAt: now,
    });
  }

  // Merge: live prices take priority, then offline fallbacks for missing IDs
  const liveIds = new Set(livePrices.map((p) => p.ingredientId));
  const merged = [
    ...livePrices,
    ...OFFLINE_PRICES.filter((p) => !liveIds.has(p.ingredientId)),
  ];

  return merged;
}

/**
 * Builds a full stub price list by combining OFFLINE_PRICES with hardcoded
 * Blumentritt-sourced values (for when the network is unavailable).
 */
function getStubPricesInternal(): MarketPrice[] {
  const now = Date.now();
  const blumentrittStubs: MarketPrice[] = [
    { ingredientId: 'rice', name: 'Rice', pricePerUnit: 55, unit: 'kg', market: 'Blumentritt (stub)', updatedAt: now },
    { ingredientId: 'pork-belly', name: 'Pork Belly', pricePerUnit: 420, unit: 'kg', market: 'Blumentritt (stub)', updatedAt: now },
    { ingredientId: 'pork-ground', name: 'Ground Pork', pricePerUnit: 320, unit: 'kg', market: 'Blumentritt (stub)', updatedAt: now },
    { ingredientId: 'bawang', name: 'Bawang (Garlic)', pricePerUnit: 120, unit: 'kg', market: 'Blumentritt (stub)', updatedAt: now },
    { ingredientId: 'ginger', name: 'Ginger', pricePerUnit: 160, unit: 'kg', market: 'Blumentritt (stub)', updatedAt: now },
    { ingredientId: 'sibuyas', name: 'Sibuyas (Onion)', pricePerUnit: 120, unit: 'kg', market: 'Blumentritt (stub)', updatedAt: now },
    { ingredientId: 'kamatis', name: 'Kamatis (Tomato)', pricePerUnit: 60, unit: 'kg', market: 'Blumentritt (stub)', updatedAt: now },
    { ingredientId: 'sitaw', name: 'Sitaw (String Beans)', pricePerUnit: 120, unit: 'kg', market: 'Blumentritt (stub)', updatedAt: now },
    { ingredientId: 'sayote', name: 'Sayote', pricePerUnit: 60, unit: 'kg', market: 'Blumentritt (stub)', updatedAt: now },
    { ingredientId: 'kalabasa', name: 'Kalabasa (Squash)', pricePerUnit: 100, unit: 'kg', market: 'Blumentritt (stub)', updatedAt: now },
    { ingredientId: 'talong', name: 'Talong (Eggplant)', pricePerUnit: 100, unit: 'kg', market: 'Blumentritt (stub)', updatedAt: now },
    { ingredientId: 'calamansi', name: 'Calamansi', pricePerUnit: 140, unit: 'kg', market: 'Blumentritt (stub)', updatedAt: now },
    { ingredientId: 'cooking-oil', name: 'Cooking Oil', pricePerUnit: 85, unit: 'L', market: 'Blumentritt (stub)', updatedAt: now },
    { ingredientId: 'sugar', name: 'Brown Sugar', pricePerUnit: 65, unit: 'kg', market: 'Blumentritt (stub)', updatedAt: now },
    { ingredientId: 'ampalaya', name: 'Ampalaya (Bitter Gourd)', pricePerUnit: 150, unit: 'kg', market: 'Blumentritt (stub)', updatedAt: now },
    { ingredientId: 'cabbage', name: 'Cabbage', pricePerUnit: 90, unit: 'kg', market: 'Blumentritt (stub)', updatedAt: now },
    { ingredientId: 'pechay', name: 'Pechay', pricePerUnit: 70, unit: 'kg', market: 'Blumentritt (stub)', updatedAt: now },
  ];
  const stubIds = new Set(blumentrittStubs.map((p) => p.ingredientId));
  return [...blumentrittStubs, ...OFFLINE_PRICES.filter((p) => !stubIds.has(p.ingredientId))];
}

const getMarketApiUrl = () =>
  process.env.EXPO_PUBLIC_MARKET_API_URL || BLUMENTRITT_API;

/**
 * Fetches current market prices from the Blumentritt Market API.
 * Falls back to stub prices on failure.
 * Results are cached for 1 hour.
 */
export async function fetchMarketPrices(): Promise<MarketPrice[]> {
  if (_cache && Date.now() - _cache.fetchedAt < CACHE_TTL_MS) {
    return _cache.prices;
  }

  const apiUrl = getMarketApiUrl();

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Market API error: ${response.status}`);
    const data: BlumentrittDashboard = await response.json();
    const prices = parseBlumentrittResponse(data);
    _cache = { prices, fetchedAt: Date.now() };
    return prices;
  } catch {
    const stubs = getStubPricesInternal();
    _cache = { prices: stubs, fetchedAt: Date.now() };
    return stubs;
  }
}

export function clearPriceCache(): void {
  _cache = null;
}

export function getStubPrices(): MarketPrice[] {
  return getStubPricesInternal();
}
