import { enrichMealWithPrices } from '@/features/meals/ingredient-calculator';
import { fetchMarketPrices } from '@/features/meals/market-api';
import { suggestMeals } from '@/features/meals/planner';
import { useHealthStore } from '@/store/use-health-store';
import { useMarketStore } from '@/store/use-market-store';
import { useUserStore } from '@/store/use-user-store';
import type { Meal } from '@/types/meals';
import { useEffect } from 'react';

export function useMealSuggestions(mealType: Meal['category'], count = 3): Meal[] {
  const { prices, setPrices, setLoading, setError } = useMarketStore();
  const snapshot = useHealthStore((s) => s.snapshot);
  const profile = useUserStore((s) => s.profile);

  useEffect(() => {
    setLoading(true);
    fetchMarketPrices()
      .then(setPrices)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to fetch prices'))
      .finally(() => setLoading(false));
  }, []);

  const suggestions = suggestMeals(mealType, snapshot, profile, count);
  return suggestions.map((meal) => enrichMealWithPrices(meal, prices));
}
