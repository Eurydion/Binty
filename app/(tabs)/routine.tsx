import { ScrollView, View, Text } from 'react-native';
import { useRoutineStore } from '@/store/use-routine-store';
import { RoutineBlock } from '@/components/routine/routine-block';
import { ActivitySlot } from '@/components/routine/activity-slot';
import { MealSlot } from '@/components/routine/meal-slot';
import { useMealSuggestions } from '@/hooks/use-meal-suggestions';
import type { ActivitySlot as ActivitySlotType, MealSlot as MealSlotType } from '@/types/routine';

export default function RoutineScreen() {
  const { routine, completeSlot } = useRoutineStore();
  const breakfastSuggestions = useMealSuggestions('breakfast', 1);
  const lunchSuggestions = useMealSuggestions('lunch', 1);
  const dinnerSuggestions = useMealSuggestions('dinner', 1);

  function getSuggestion(slot: MealSlotType) {
    if (slot.mealType === 'breakfast') return breakfastSuggestions[0] ?? null;
    if (slot.mealType === 'lunch') return lunchSuggestions[0] ?? null;
    return dinnerSuggestions[0] ?? null;
  }

  if (!routine) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-400">Generating your routine...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerClassName="px-5 pt-14 pb-8">
      <Text className="text-2xl font-bold text-gray-900 mb-6">Today's Routine</Text>
      {routine.blocks.map((block) => (
        <RoutineBlock key={block.id} block={block}>
          {block.slots.map((slot) => {
            if (slot.type === 'meal') {
              return (
                <MealSlot
                  key={slot.id}
                  slot={slot as MealSlotType}
                  suggestion={getSuggestion(slot as MealSlotType)}
                  onLog={() => {/* TODO: open log-meal modal */}}
                />
              );
            }
            if (slot.type === 'activity' || slot.type === 'rest' || slot.type === 'custom') {
              return (
                <ActivitySlot
                  key={slot.id}
                  slot={slot as ActivitySlotType}
                  onComplete={() => completeSlot(slot.id)}
                />
              );
            }
            return null;
          })}
        </RoutineBlock>
      ))}
      {routine.blocks.length === 0 && (
        <Text className="text-gray-400 text-center mt-12">
          Your routine will appear here once generated.
        </Text>
      )}
    </ScrollView>
  );
}
