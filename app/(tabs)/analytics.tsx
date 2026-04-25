import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConnectionCard } from '@/components/analytics/connection-card';
import { HeartRateChartCard } from '@/components/analytics/heart-rate-chart-card';
import { KeyMetricsStrip, pctDelta, trendOf } from '@/components/analytics/key-metrics-strip';
import { LearnMoreCard } from '@/components/analytics/learn-more-card';
import { ScenarioPicker } from '@/components/analytics/scenario-picker';
import { SleepCard } from '@/components/analytics/sleep-card';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/features/hooks/use-color-scheme';
import { useHealthStore } from '@/store/use-health-store';

export default function AnalyticsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const snapshot = useHealthStore((s) => s.snapshot);
  const history = useHealthStore((s) => s.history);
  const connection = useHealthStore((s) => s.connection);

  const { latest } = snapshot;
  const bpmSeries = history.map((h) => h.bpm);
  const stepSeries = history.map((h) => h.steps);
  const stressSeries = history.map((h) => h.stress);

  const stressColor =
    latest.stressLevel >= 70
      ? '#D97757'
      : latest.stressLevel >= 50
      ? Palette.kamote
      : Palette.kangkong;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32, gap: 12 }}
      >
        <ScreenHeader title="Analytics" />

        {/* 1. Connection */}
        <ConnectionCard />

        {/* 3. Scenario picker (when connected/paused) */}
        {connection !== 'disconnected' ? <ScenarioPicker /> : null}

        {/* 4. Key metrics — single full-width strip */}
        <KeyMetricsStrip
          segments={[
            {
              icon: 'heart',
              label: 'BPM',
              value: `${latest.heartRate}`,
              trend: trendOf(bpmSeries),
              deltaPct: pctDelta(bpmSeries),
              color: Palette.kangkong,
            },
            {
              icon: 'walk',
              label: 'Steps',
              value: latest.steps.toLocaleString(),
              trend: trendOf(stepSeries),
              deltaPct: pctDelta(stepSeries),
              color: Palette.teal,
            },
            {
              icon: 'flash',
              label: 'Stress',
              value: `${latest.stressLevel}`,
              unit: '/100',
              trend: trendOf(stressSeries),
              deltaPct: pctDelta(stressSeries),
              color: stressColor,
            },
          ]}
        />

        {/* 5. Sleep (timeline) */}
        <SleepCard />

        {/* 6. Heart rate chart */}
        <HeartRateChartCard />

        {/* 7. Learn more */}
        <LearnMoreCard />
      </ScrollView>
    </SafeAreaView>
  );
}
