import { View, Text, TouchableOpacity } from 'react-native';
import type { Intervention } from '@/features/wellness-engine/interventions';

interface Props {
  intervention: Intervention;
  onDismiss: () => void;
  onDone: () => void;
}

export function InterventionBanner({ intervention, onDismiss, onDone }: Props) {
  return (
    <View className="mx-4 rounded-2xl bg-yellow-50 border border-yellow-200 p-4">
      <Text className="text-base font-semibold text-yellow-900">{intervention.title}</Text>
      <Text className="text-sm text-yellow-700 mt-1">{intervention.body}</Text>
      <MitigationSteps steps={intervention.steps} />
      <View className="flex-row gap-3 mt-4">
        <TouchableOpacity
          onPress={onDone}
          className="flex-1 bg-yellow-500 rounded-xl py-2 items-center">
          <Text className="text-white font-semibold text-sm">I did this ✓</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDismiss}
          className="px-4 py-2 items-center">
          <Text className="text-yellow-700 text-sm">Dismiss</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface StepsProps {
  steps: string[];
}

export function MitigationSteps({ steps }: StepsProps) {
  return (
    <View className="mt-3 gap-1">
      {steps.map((step, i) => (
        <View key={i} className="flex-row gap-2">
          <Text className="text-yellow-600 font-semibold text-sm w-4">{i + 1}.</Text>
          <Text className="text-sm text-yellow-800 flex-1">{step}</Text>
        </View>
      ))}
    </View>
  );
}
