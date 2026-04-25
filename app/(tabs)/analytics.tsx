import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/screen-header';
import { Borders, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSmartwatch } from '@/hooks/use-smartwatch';

export default function AnalyticsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const snapshot = useSmartwatch();
  const { latest, sleep, detectedState } = snapshot;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
      >
        <ScreenHeader title="Analytics" />

        <Section title="Live Readings" scheme={scheme}>
          <StatRow label="Heart Rate" value={`${latest.heartRate} bpm`} />
          <StatRow label="HRV" value={`${latest.hrv} ms`} />
          <StatRow label="SpO2" value={`${latest.spo2}%`} />
          <StatRow label="Steps" value={latest.steps.toLocaleString()} />
          <StatRow label="Stress Score" value={`${latest.stressLevel} / 100`} />
          <StatRow label="Detected State" value={detectedState} />
        </Section>

        {sleep && (
          <Section title="Last Night's Sleep" scheme={scheme}>
            <StatRow
              label="Duration"
              value={`${Math.round(sleep.durationMinutes / 60)}h ${sleep.durationMinutes % 60}m`}
            />
            <StatRow label="Quality" value={sleep.quality} />
            <StatRow label="Deep Sleep" value={`${sleep.deepSleepMinutes} min`} />
            <StatRow label="REM Sleep" value={`${sleep.remSleepMinutes} min`} />
          </Section>
        )}

        <Text
          style={{
            color: c.iconMuted,
            fontSize: 11,
            textAlign: 'center',
            marginTop: 16,
            paddingHorizontal: 24,
          }}
        >
          Data source: {snapshot.source}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  scheme,
  children,
}: {
  title: string;
  scheme: 'light' | 'dark';
  children: React.ReactNode;
}) {
  const c = Colors[scheme];
  return (
    <View style={{ paddingHorizontal: 24, marginBottom: 12 }}>
      <View
        style={{
          backgroundColor: c.surface,
          borderRadius: 24,
          padding: 16,
          borderWidth: 1,
          borderColor: Borders.hairline[scheme],
          gap: 8,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: '700',
            color: c.iconMuted,
            letterSpacing: 0.6,
            marginBottom: 4,
          }}
        >
          {title.toUpperCase()}
        </Text>
        {children}
      </View>
    </View>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ fontSize: 13, color: c.iconMuted }}>{label}</Text>
      <Text style={{ fontSize: 13, fontWeight: '600', color: c.text }}>{value}</Text>
    </View>
  );
}
