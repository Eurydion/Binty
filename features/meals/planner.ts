import type { Meal } from '@/types/meals';
import type { HealthSnapshot } from '@/types/health';
import type { UserProfile } from '@/types/user';
import { FILIPINO_MEALS } from './recipes';

/**
 * Suggests meals for a given meal type based on current health state and user preferences.
 */
export function suggestMeals(
  mealType: Meal['category'],
  health: HealthSnapshot,
  user: UserProfile,
  count = 3,
): Meal[] {
  return FILIPINO_MEALS.filter((meal) => {
    if (meal.category !== mealType) return false;
    if (user.dietaryPreferences.includes('no-pork')) {
      const hasPork = meal.ingredients.some((i) => i.name.toLowerCase().includes('pork'));
      if (hasPork) return false;
    }

    // Prefer calming meals on high stress days
    if (health.latest.stressLevel > 60 && !meal.tags.includes('calming')) return false;

    return true;
  }).slice(0, count);
}
