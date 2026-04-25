import { View, Text } from 'react-native';

interface Props {
  loggedMl: number;
  goalMl: number;
}

export function WaterIntakeCard({ loggedMl, goalMl }: Props) {
  const pct = Math.min(1, loggedMl / goalMl);
  const litres = (loggedMl / 1000).toFixed(1);

  return (
    <View className="flex-1 rounded-2xl bg-blue-50 p-4">
      <Text className="text-2xl font-bold text-blue-600">{litres}L</Text>
      <Text className="text-xs text-blue-400 mt-0.5">Water Intake</Text>
      <View className="mt-3 h-1.5 rounded-full bg-blue-100">
        <View
          className="h-1.5 rounded-full bg-blue-400"
          style={{ width: `${Math.round(pct * 100)}%` }}
        />
      </View>
      <Text className="text-xs text-blue-400 mt-1">
        {loggedMl}ml / {goalMl}ml
      </Text>
    </View>
  );
}
