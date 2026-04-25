import type { MarketPrice, Meal } from '@/types/meals';

/**
 * Calculates estimated total cost of a meal using current market prices.
 */
export function calculateMealCost(meal: Meal, prices: MarketPrice[]): number {
  return meal.ingredients.reduce((total, ingredient) => {
    const price = prices.find((p) => p.ingredientId === ingredient.id);
    if (!price) return total;
    return total + price.pricePerUnit * ingredient.quantity;
  }, 0);
}

/**
 * Attaches live market prices to a meal's ingredient list.
 */
export function enrichMealWithPrices(meal: Meal, prices: MarketPrice[]): Meal {
  return {
    ...meal,
    ingredients: meal.ingredients.map((ingredient) => {
      const price = prices.find((p) => p.ingredientId === ingredient.id);
      return price
        ? { ...ingredient, marketPricePerUnit: price.pricePerUnit, priceUpdatedAt: price.updatedAt }
        : ingredient;
    }),
    estimatedCostPhp: calculateMealCost(meal, prices),
  };
}
