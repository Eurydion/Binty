import { useSmartwatch } from '@/hooks/use-smartwatch';
import { ScrollView, Text, View } from 'react-native';

export default function AnalyticsScreen() {
  const snapshot = useSmartwatch();
  const { latest, sleep, detectedState } = snapshot;

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerClassName="px-5 pt-14 pb-8">
      <Text className="text-2xl font-bold text-gray-900 mb-6">Analytics</Text>

      {/* Current readings */}
      <View className="bg-white rounded-2xl p-4 mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-3">Live Readings</Text>
        <View className="gap-2">
          <StatRow label="Heart Rate" value={`${latest.heartRate} bpm`} />
          <StatRow label="HRV" value={`${latest.hrv} ms`} />
          <StatRow label="SpO2" value={`${latest.spo2}%`} />
          <StatRow label="Steps" value={`${latest.steps.toLocaleString()}`} />
          <StatRow label="Stress Score" value={`${latest.stressLevel} / 100`} />
          <StatRow label="Detected State" value={detectedState} />
        </View>
      </View>

      {/* Sleep */}
      {sleep && (
        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-3">Last Night's Sleep</Text>
          <View className="gap-2">
            <StatRow label="Duration" value={`${Math.round(sleep.durationMinutes / 60)}h ${sleep.durationMinutes % 60}m`} />
            <StatRow label="Quality" value={sleep.quality} />
            <StatRow label="Deep Sleep" value={`${sleep.deepSleepMinutes} min`} />
            <StatRow label="REM Sleep" value={`${sleep.remSleepMinutes} min`} />
          </View>
        </View>
      )}

      <Text className="text-xs text-gray-400 text-center mt-2">
        Data source: {snapshot.source} · Updates every 30s
      </Text>
    </ScrollView>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text className="text-sm font-medium text-gray-800">{value}</Text>
    </View>
  );
}
