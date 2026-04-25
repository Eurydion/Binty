import { ScrollView, View, Text } from 'react-native';
import { useSmartwatch } from '@/hooks/use-smartwatch';
import { useRoutineStore } from '@/store/use-routine-store';
import { useUserStore } from '@/store/use-user-store';
import { useInterventions } from '@/hooks/use-interventions';
import { InterventionBanner } from '@/components/alerts/intervention-banner';
import { WaterIntakeCard } from '@/components/cards/water-intake-card';
import { MealSuggestionCard } from '@/components/cards/meal-suggestion-card';
import { useRouter } from 'expo-router';
import { useMealSuggestions } from '@/hooks/use-meal-suggestions';

export default function HomeScreen() {
  const snapshot = useSmartwatch();
  const profile = useUserStore((s) => s.profile);
  const { waterLoggedMl } = useRoutineStore();
  const { current, dismiss, markDone } = useInterventions();
  const router = useRouter();

  const hour = new Date().getHours();
  const mealType = hour < 11 ? 'breakfast' : hour < 15 ? 'lunch' : 'dinner';
  const suggestions = useMealSuggestions(mealType, 1);
  const topMeal = suggestions[0] ?? null;

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerClassName="pb-8">
      {/* Header */}
      <View className="px-5 pt-14 pb-4">
        <Text className="text-2xl font-bold text-gray-900">Binty</Text>
        <Text className="text-lg text-gray-600 mt-1">
          How are you, {profile.name}?
        </Text>
      </View>

      {/* Intervention alert */}
      {current && (
        <View className="mb-4">
          <InterventionBanner
            intervention={current}
            onDismiss={dismiss}
            onDone={markDone}
          />
        </View>
      )}

      {/* Wellness ring */}
      <View className="items-center my-6">
        <View className="w-36 h-36 rounded-full border-8 border-blue-200 items-center justify-center bg-white">
          <Text className="text-2xl font-bold text-blue-500">
            {100 - snapshot.latest.stressLevel}
          </Text>
          <Text className="text-xs text-gray-400">Wellness</Text>
        </View>
      </View>

      {/* Quick stats row */}
      <View className="flex-row gap-3 px-5 mb-4">
        <MealSuggestionCard
          meal={topMeal}
          onPress={() => router.push('/(tabs)/routine')}
        />
        <WaterIntakeCard
          loggedMl={waterLoggedMl}
          goalMl={profile.dailyWaterGoalMl}
        />
      </View>

      {/* Stress chart placeholder */}
      <View className="mx-5 rounded-2xl bg-white p-4">
        <Text className="text-sm font-semibold text-gray-700 mb-2">Stress Analytics</Text>
        <View className="h-24 bg-gray-50 rounded-xl items-center justify-center">
          <Text className="text-xs text-gray-400">
            Stress: {snapshot.latest.stressLevel} · HR: {snapshot.latest.heartRate} bpm
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
