import { View, Text, TouchableOpacity } from 'react-native';
import type { Meal } from '@/types/meals';

interface Props {
  meal: Meal | null;
  onPress: () => void;
}

export function MealSuggestionCard({ meal, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 rounded-2xl bg-green-50 p-4">
      <Text className="text-xs text-green-500 font-medium mb-1">Meal Plan</Text>
      {meal ? (
        <>
          <Text className="text-sm font-semibold text-green-900" numberOfLines={1}>
            {meal.name}
          </Text>
          {meal.estimatedCostPhp != null && (
            <Text className="text-xs text-green-500 mt-0.5">
              ~₱{Math.round(meal.estimatedCostPhp)}
            </Text>
          )}
        </>
      ) : (
        <Text className="text-sm text-green-400">No suggestion yet</Text>
      )}
    </TouchableOpacity>
  );
}
