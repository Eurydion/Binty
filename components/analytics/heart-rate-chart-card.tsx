import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { LineChart } from '@/components/charts/line-chart';
import { Borders, Colors, Palette, Radii, Spacing } from '@/constants/theme';
import { SCENARIOS } from '@/features/simulation/scenarios';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHealthStore } from '@/store/use-health-store';

export function HeartRateChartCard() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const history = useHealthStore((s) => s.history);
  const connection = useHealthStore((s) => s.connection);
  const scenario = useHealthStore((s) => s.scenario);
  const snapshot = useHealthStore((s) => s.snapshot);
  const [width, setWidth] = useState(0);

  const data = history.map((h) => h.bpm);
  const min = data.length ? Math.min(...data) : 0;
  const max = data.length ? Math.max(...data) : 0;
  const avg = data.length ? Math.round(data.reduce((a, b) => a + b, 0) / data.length) : 0;

  return (
    <View style={{ paddingHorizontal: 24 }}>
      <View
        style={{
          backgroundColor: c.surface,
          borderRadius: Radii.lg,
          padding: Spacing.lg,
          borderWidth: 1,
          borderColor: Borders.hairline[scheme],
        }}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width - Spacing.lg * 2)}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="pulse" size={16} color={Palette.kangkong} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: c.iconMuted, letterSpacing: 0.4 }}>
              HEART RATE TREND
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: c.text }}>
              {snapshot.latest.heartRate}
            </Text>
            <Text style={{ fontSize: 11, color: c.iconMuted }}>BPM</Text>
          </View>
        </View>

        <View
          style={{
            alignSelf: 'flex-start',
            backgroundColor: Palette.kangkong + '1A',
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: Radii.pill,
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: '700', color: Palette.kangkong }}>
            {SCENARIOS[scenario].label.toUpperCase()}
          </Text>
        </View>

        {data.length > 1 && width > 0 ? (
          <LineChart
            data={data}
            width={width}
            height={140}
            color={Palette.kangkong}
            baseline={avg}
            yMin={40}
            yMax={180}
            windowSize={90}
            showLabels
          />
        ) : (
          <View style={{ height: 140, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="watch-outline" size={28} color={c.iconMuted} />
            <Text style={{ marginTop: 8, fontSize: 12, color: c.iconMuted, textAlign: 'center' }}>
              {connection === 'disconnected'
                ? 'Connect smartwatch to see live data'
                : 'Collecting samples…'}
            </Text>
          </View>
        )}

        {data.length > 1 ? (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
            <Stat label="Min" value={min} c={c} />
            <Stat label="Avg" value={avg} c={c} />
            <Stat label="Max" value={max} c={c} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

function Stat({ label, value, c }: { label: string; value: number; c: { text: string; iconMuted: string } }) {
  return (
    <View>
      <Text style={{ fontSize: 10, fontWeight: '600', color: c.iconMuted, letterSpacing: 0.4 }}>
        {label.toUpperCase()}
      </Text>
      <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>{value}</Text>
    </View>
  );
}
