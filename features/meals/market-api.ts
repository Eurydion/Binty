import type { MarketPrice } from '@/types/meals';
import { resolveNearestMarket } from './market-locator';
import { fetchAIPriceFallback } from './ai-price-fallback';

const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour
const BLUMENTRITT_API = 'https://api.anomura.today/api/markets/500/dashboard';
const ANOMURA_DASHBOARD = (id: number) =>
  `https://api.anomura.today/api/markets/${id}/dashboard`;

let _cache: { prices: MarketPrice[]; fetchedAt: number } | null = null;

/**
 * Maps Blumentritt Market API item names → our ingredient IDs.
 * Only items we can confidently map are included.
 */
const API_NAME_TO_ID: Record<string, { id: string; name: string; unit: string }> = {
  'COMMERCIAL (LOCAL) Premium (Yellow tagged)': { id: 'rice', name: 'Rice', unit: 'kg' },
  'Pork Belly (Liempo)': { id: 'pork-belly', name: 'Pork Belly', unit: 'kg' },
  'Pork Ham (Kasim)': { id: 'pork-ground', name: 'Ground Pork', unit: 'kg' },
  'Garlic(Imported)': { id: 'bawang', name: 'Bawang (Garlic)', unit: 'cloves' },
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
  { ingredientId: 'tablea', name: 'Tablea (Cacao Tablets)', pricePerUnit: 8, unit: 'piece', market: 'Estimate', updatedAt: Date.now() },
  { ingredientId: 'saba', name: 'Saba Banana', pricePerUnit: 5, unit: 'piece', market: 'Estimate', updatedAt: Date.now() },
  { ingredientId: 'langka', name: 'Jackfruit (Langka)', pricePerUnit: 80, unit: 'kg', market: 'Estimate', updatedAt: Date.now() },
  { ingredientId: 'lumpia-wrapper', name: 'Lumpia Wrapper', pricePerUnit: 30, unit: 'pack', market: 'Estimate', updatedAt: Date.now() },
  { ingredientId: 'potato', name: 'Potato', pricePerUnit: 80, unit: 'kg', market: 'Estimate', updatedAt: Date.now() },
  { ingredientId: 'corn', name: 'Corn on the Cob', pricePerUnit: 15, unit: 'piece', market: 'Estimate', updatedAt: Date.now() },
  { ingredientId: 'evap-milk', name: 'Evaporated Milk', pricePerUnit: 22, unit: 'can', market: 'Estimate', updatedAt: Date.now() },
  { ingredientId: 'cooking-oil', name: 'Cooking Oil', pricePerUnit: 85, unit: 'L', market: 'Estimate', updatedAt: Date.now() },
  { ingredientId: 'sugar', name: 'Brown Sugar', pricePerUnit: 65, unit: 'kg', market: 'Estimate', updatedAt: Date.now() },
];

interface MarketDashboard {
  market: { id: number; name: string };
  latestDate: string;
  periods: {
    '7d': {
      items: Array<{ name: string; price: number; unit: string }>;
    };
  };
}

/**
 * Converts a market dashboard API response into our MarketPrice[] format.
 */
function parseDashboardResponse(data: MarketDashboard): MarketPrice[] {
  const marketName = data.market.name;
  const now = Date.now();
  const livePrices: MarketPrice[] = [];
  const seenIds = new Set<string>();

  for (const item of data.periods['7d'].items) {
    const mapping = API_NAME_TO_ID[item.name];
    if (!mapping || seenIds.has(mapping.id)) continue;
    seenIds.add(mapping.id);

    // API returns PHP/kg — convert to per-clove for garlic (~200 cloves/kg)
    const price = mapping.unit === 'cloves' ? item.price / 200 : item.price;

    livePrices.push({
      ingredientId: mapping.id,
      name: mapping.name,
      pricePerUnit: price,
      unit: mapping.unit,
      market: marketName,
      updatedAt: now,
    });
  }

  return livePrices;
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
    { ingredientId: 'bawang', name: 'Bawang (Garlic)', pricePerUnit: 0.6, unit: 'cloves', market: 'Blumentritt (stub)', updatedAt: now },
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

const getMarketApiUrl = (marketId?: number) =>
  process.env.EXPO_PUBLIC_MARKET_API_URL ||
  (marketId ? ANOMURA_DASHBOARD(marketId) : BLUMENTRITT_API);

/**
 * Fetches current market prices from the nearest wet market via Anomura API.
 * Falls back to AI-estimated prices for uncovered ingredients, then to stub prices.
 * Results are cached for 1 hour.
 */
export async function fetchMarketPrices(): Promise<MarketPrice[]> {
  if (_cache && Date.now() - _cache.fetchedAt < CACHE_TTL_MS) {
    return _cache.prices;
  }

  try {
    // Resolve nearest market dynamically
    const market = await resolveNearestMarket();
    const apiUrl = getMarketApiUrl(market.id);

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Market API error: ${response.status}`);
    const data: MarketDashboard = await response.json();
    const prices = parseDashboardResponse(data);

    // Identify offline-only ingredients that weren't covered by live API
    const liveIds = new Set(prices.map((p) => p.ingredientId));
    const missingOffline = OFFLINE_PRICES.filter((p) => !liveIds.has(p.ingredientId));

    // Try AI fallback for the missing ingredients (non-blocking — offline stubs fill gaps on failure)
    if (missingOffline.length > 0) {
      let aiPrices: MarketPrice[] = [];
      try {
        aiPrices = await fetchAIPriceFallback(
          missingOffline.map((p) => ({ id: p.ingredientId, name: p.name, unit: p.unit })),
          market.name,
        );
      } catch {
        // AI unavailable — offline stubs will cover
      }

      const aiIds = new Set(aiPrices.map((p) => p.ingredientId));
      // Merge: live > AI > offline stubs
      const merged = [
        ...prices,
        ...aiPrices,
        ...missingOffline.filter((p) => !aiIds.has(p.ingredientId)),
      ];

      _cache = { prices: merged, fetchedAt: Date.now() };
      return merged;
    }

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
