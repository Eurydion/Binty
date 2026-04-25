import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useRoutineStore } from '@/store/use-routine-store';
import { FILIPINO_MEALS } from '@/features/meals/recipes';
import type { MealLog } from '@/types/meals';

export default function LogMealModal() {
  const router = useRouter();
  const logMeal = useRoutineStore((s) => s.logMeal);

  function handleLog(mealId: string) {
    const log: MealLog = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      mealType: 'lunch', // TODO: pass mealType via route params
      mealId,
      loggedAt: Date.now(),
    };
    logMeal(log);
    router.back();
  }

  return (
    <View className="flex-1 bg-white px-6 pt-12">
      <Text className="text-xl font-bold text-gray-900 mb-6">Log a Meal</Text>
      <View className="gap-3">
        {FILIPINO_MEALS.map((meal) => (
          <TouchableOpacity
            key={meal.id}
            onPress={() => handleLog(meal.id)}
            className="bg-gray-50 rounded-2xl px-4 py-3">
            <Text className="text-sm font-semibold text-gray-800">{meal.name}</Text>
            <Text className="text-xs text-gray-400 mt-0.5">
              {meal.calories} kcal · {meal.prepMinutes} min prep
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
