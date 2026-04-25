import { Ionicons } from '@expo/vector-icons';
import type { Meal } from '@/types/meals';
import type { MealSlot as MealSlotType } from '@/types/routine';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  slot: MealSlotType;
  suggestion: Meal | null;
  onLog: () => void;
}

export function MealSlot({ slot, suggestion, onLog }: Props) {
  const label =
    slot.mealType.charAt(0).toUpperCase() + slot.mealType.slice(1);

  return (
    <View className="flex-row items-start gap-3 py-3">
      <Text className="text-xs text-gray-400 w-14 pt-0.5">{slot.time}</Text>
      <View className="flex-1">
        <View className="flex-row items-center gap-1">
          <Ionicons name="restaurant-outline" size={14} color="#4F7942" />
          <Text className="text-sm font-semibold text-gray-700">{label}</Text>
        </View>
        {suggestion && (
          <Text className="text-xs text-gray-500 mt-0.5">
            Suggestion: {suggestion.name}
            {suggestion.estimatedCostPhp != null
              ? ` · ~₱${Math.round(suggestion.estimatedCostPhp)}`
              : ''}
          </Text>
        )}
        {slot.loggedMealId ? (
          <Text className="text-xs text-green-600 mt-1">✓ Logged</Text>
        ) : (
          <TouchableOpacity onPress={onLog} className="mt-1">
            <Text className="text-xs text-blue-500">+ Log meal</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
