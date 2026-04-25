import { MitigationSteps } from '@/components/alerts/intervention-banner';
import { useInterventions } from '@/hooks/use-interventions';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function InterventionModal() {
  const router = useRouter();
  const { current, dismiss, markDone } = useInterventions();

  if (!current) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-400">No active alerts.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-blue-500">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="px-6 pt-12 pb-10">
      <Text className="text-xl font-bold text-gray-900">{current.title}</Text>
      <Text className="text-sm text-gray-500 mt-2">{current.body}</Text>

      <Text className="text-sm font-semibold text-gray-700 mt-6 mb-2">Try this now:</Text>
      <MitigationSteps steps={current.steps} />

      <TouchableOpacity
        onPress={() => { markDone(); router.back(); }}
        className="mt-8 bg-yellow-500 rounded-2xl py-4 items-center">
        <Text className="text-white font-semibold">I did this ✓</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => { dismiss(); router.back(); }}
        className="mt-3 items-center">
        <Text className="text-gray-400">Dismiss</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
