import { chatCompletionJSON } from '@/services/ai';
import type { MarketPrice } from '@/types/meals';

const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

interface CacheEntry {
  prices: MarketPrice[];
  cachedAt: number;
}

// Module-level cache keyed by sorted ingredient IDs
const _cache = new Map<string, CacheEntry>();

interface IngredientInput {
  id: string;
  name: string;
  unit: string;
}

interface AIPriceItem {
  id: string;
  name: string;
  pricePerUnit: number;
  unit: string;
}

/**
 * Uses AI to estimate current PHP market prices for ingredients
 * that have no live market data. Results are cached for 24 hours.
 * Returns empty array on any failure (no API key, network error, etc.).
 */
export async function fetchAIPriceFallback(
  ingredients: IngredientInput[],
  city?: string,
): Promise<MarketPrice[]> {
  if (ingredients.length === 0) return [];

  // Check cache
  const cacheKey = ingredients
    .map((i) => i.id)
    .sort()
    .join(',');
  const cached = _cache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return cached.prices;
  }

  try {
    const ingredientList = ingredients
      .map((i) => `- ${i.name} (ID: ${i.id}, unit: ${i.unit})`)
      .join('\n');

    const locationHint = city ? ` in ${city}` : ' in the Philippines';

    const result = await chatCompletionJSON<{ prices: AIPriceItem[] }>({
      messages: [
        {
          role: 'system',
          content:
            'You are a Philippine grocery pricing assistant. Estimate current wet market prices in PHP. Be realistic based on typical palengke prices. Respond ONLY with JSON.',
        },
        {
          role: 'user',
          content: `Estimate the current price in PHP for each ingredient${locationHint}. Return JSON: { "prices": [{ "id": "<ingredientId>", "name": "<name>", "pricePerUnit": <number>, "unit": "<unit>" }] }\n\nIngredients:\n${ingredientList}`,
        },
      ],
      temperature: 0.3,
      maxTokens: 1024,
    });

    const now = Date.now();
    const prices: MarketPrice[] = (result.prices ?? []).map((item) => ({
      ingredientId: item.id,
      name: item.name,
      pricePerUnit: item.pricePerUnit,
      unit: item.unit,
      market: 'AI Estimate',
      updatedAt: now,
    }));

    _cache.set(cacheKey, { prices, cachedAt: now });
    return prices;
  } catch {
    return [];
  }
}
