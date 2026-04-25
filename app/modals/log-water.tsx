import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useRoutineStore } from '@/store/use-routine-store';

const QUICK_AMOUNTS = [150, 250, 350, 500];

export default function LogWaterModal() {
  const router = useRouter();
  const logWater = useRoutineStore((s) => s.logWater);

  function handleLog(ml: number) {
    logWater(ml);
    router.back();
  }

  return (
    <View className="flex-1 bg-white px-6 pt-12">
      <Text className="text-xl font-bold text-gray-900 mb-2">Log Water</Text>
      <Text className="text-sm text-gray-500 mb-8">How much did you drink?</Text>
      <View className="flex-row flex-wrap gap-3">
        {QUICK_AMOUNTS.map((ml) => (
          <TouchableOpacity
            key={ml}
            onPress={() => handleLog(ml)}
            className="bg-blue-50 rounded-2xl px-6 py-4 items-center">
            <Text className="text-lg font-bold text-blue-600">{ml}ml</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        onPress={() => router.back()}
        className="mt-8 items-center">
        <Text className="text-gray-400">Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}
