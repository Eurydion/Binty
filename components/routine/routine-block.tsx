import type { RoutineBlock as RoutineBlockType } from '@/types/routine';
import { Text, View } from 'react-native';

interface Props {
  block: RoutineBlockType;
  children: React.ReactNode;
}

export function RoutineBlock({ block, children }: Props) {
  return (
    <View className="mb-6">
      <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
        {block.label}
      </Text>
      <View className="bg-white rounded-2xl px-4 divide-y divide-gray-100">
        {children}
      </View>
    </View>
  );
}
