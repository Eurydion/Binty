import type { ActivitySlot as ActivitySlotType } from '@/types/routine';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  slot: ActivitySlotType;
  onComplete: () => void;
}

export function ActivitySlot({ slot, onComplete }: Props) {
  return (
    <View className="flex-row items-start gap-3 py-3">
      <Text className="text-xs text-gray-400 w-14 pt-0.5">{slot.time}</Text>
      <View className="flex-1">
        <Text className={`text-sm font-semibold ${slot.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
          {slot.title}
        </Text>
        <Text className="text-xs text-gray-400 mt-0.5">
          {slot.durationMinutes} min · {slot.intensity}
        </Text>
        {slot.description && (
          <Text className="text-xs text-gray-500 mt-0.5">{slot.description}</Text>
        )}
      </View>
      {!slot.completed && (
        <TouchableOpacity
          onPress={onComplete}
          className="bg-gray-100 rounded-full px-3 py-1">
          <Text className="text-xs text-gray-600">Done</Text>
        </TouchableOpacity>
      )}
      {slot.completed && (
        <Text className="text-green-500 text-sm">✓</Text>
      )}
    </View>
  );
}
