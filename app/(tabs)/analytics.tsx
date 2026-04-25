import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConnectionCard } from '@/components/analytics/connection-card';
import { HeartRateChartCard } from '@/components/analytics/heart-rate-chart-card';
import { LearnMoreCard } from '@/components/analytics/learn-more-card';
import { MetricCard } from '@/components/analytics/metric-card';
import { QuoteCard } from '@/components/analytics/quote-card';
import { RecoveryCard } from '@/components/analytics/recovery-card';
import { ScenarioPicker } from '@/components/analytics/scenario-picker';
import { SleepCard } from '@/components/analytics/sleep-card';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHealthStore } from '@/store/use-health-store';

const QUALITY_SCORE = { poor: 40, fair: 70, good: 90 } as const;

function trend(values: number[]): 'up' | 'down' | 'flat' {
  if (values.length < 4) return 'flat';
  const half = Math.floor(values.length / 2);
  const a = values.slice(0, half).reduce((s, v) => s + v, 0) / half;
  const b = values.slice(half).reduce((s, v) => s + v, 0) / (values.length - half);
  if (b - a > 2) return 'up';
  if (a - b > 2) return 'down';
  return 'flat';
}

export default function AnalyticsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const snapshot = useHealthStore((s) => s.snapshot);
  const history = useHealthStore((s) => s.history);
  const connection = useHealthStore((s) => s.connection);

  const { latest, sleep } = snapshot;
  const bpmSeries = history.map((h) => h.bpm);
  const stepSeries = history.map((h) => h.steps);
  const stressSeries = history.map((h) => h.stress);

  const stressColor =
    latest.stressLevel >= 70 ? '#D97757' : latest.stressLevel >= 50 ? Palette.kamote : Palette.kangkong;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32, gap: 12 }}
      >
        <ScreenHeader title="Analytics" />

        {/* 1. Daily quote */}
        <QuoteCard />

        {/* 2. Connection */}
        <ConnectionCard />

        {/* 3. Scenario picker (when connected/paused) */}
        {connection !== 'disconnected' ? <ScenarioPicker /> : null}

        {/* 4. Key metrics — 3 up */}
        <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 24 }}>
          <MetricCard
            icon="heart"
            label="BPM"
            value={`${latest.heartRate}`}
            unit="bpm"
            data={bpmSeries}
            trend={trend(bpmSeries)}
            color={Palette.kangkong}
          />
          <MetricCard
            icon="walk"
            label="Steps"
            value={latest.steps.toLocaleString()}
            data={stepSeries}
            trend={trend(stepSeries)}
            color={Palette.teal}
          />
          <MetricCard
            icon="flash"
            label="Stress"
            value={`${latest.stressLevel}`}
            unit="/100"
            data={stressSeries}
            trend={trend(stressSeries)}
            color={stressColor}
          />
        </View>

        {/* 5. Recovery & sleep — 2 up */}
        <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 24 }}>
          <SleepCard sleep={sleep} />
          <RecoveryCard
            stress={latest.stressLevel}
            sleepQualityScore={sleep ? QUALITY_SCORE[sleep.quality] : 70}
          />
        </View>

        {/* 6. Heart rate chart */}
        <HeartRateChartCard />

        {/* 7. Learn more */}
        <LearnMoreCard />
      </ScrollView>
    </SafeAreaView>
  );
}
