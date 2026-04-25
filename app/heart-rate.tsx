import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LineChart } from '@/components/charts/line-chart';
import { Borders, Colors, Palette, Radii, Spacing } from '@/constants/theme';
import { SCENARIOS } from '@/features/simulation/scenarios';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHealthStore } from '@/store/use-health-store';

export default function HeartRateScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const snapshot = useHealthStore((s) => s.snapshot);
  const history = useHealthStore((s) => s.history);
  const connection = useHealthStore((s) => s.connection);
  const scenario = useHealthStore((s) => s.scenario);
  const connect = useHealthStore((s) => s.connect);
  const [chartWidth, setChartWidth] = useState(0);

  const bpm = snapshot.latest.heartRate;
  const stress = snapshot.latest.stressLevel;
  const data = history.map((h) => h.bpm);
  const min = data.length ? Math.min(...data) : bpm;
  const max = data.length ? Math.max(...data) : bpm;
  const avg = data.length ? Math.round(data.reduce((a, b) => a + b, 0) / data.length) : bpm;

  const scale = useSharedValue(1);
  useEffect(() => {
    if (connection !== 'connected' || bpm <= 0) {
      cancelAnimation(scale);
      scale.value = 1;
      return;
    }
    const period = Math.max(300, Math.round(60000 / bpm));
    cancelAnimation(scale);
    scale.value = withRepeat(
      withTiming(1.25, { duration: period / 2, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [bpm, connection, scale]);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const stressColor =
    stress >= 70 ? '#D97757' : stress >= 50 ? Palette.kamote : Palette.kangkong;

  return (
    <>
      <Stack.Screen options={{ title: 'Heart Rate' }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['bottom']}>
        <ScrollView contentContainerStyle={{ paddingVertical: 24, gap: 16 }}>
          {/* Hero */}
          <View style={{ paddingHorizontal: 24, alignItems: 'center' }}>
            <View
              style={{
                width: 140,
                height: 140,
                borderRadius: 9999,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: Palette.kangkong + '14',
              }}
            >
              <Animated.View style={pulseStyle}>
                <Ionicons name="heart" size={64} color={Palette.kangkong} />
              </Animated.View>
            </View>
            <Text style={{ fontSize: 64, fontWeight: '700', color: c.text, marginTop: 12 }}>
              {bpm}
            </Text>
            <Text style={{ fontSize: 14, color: c.iconMuted, marginTop: -4 }}>BPM</Text>
            <View
              style={{
                marginTop: 8,
                backgroundColor: Palette.kangkong + '1A',
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: Radii.pill,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: Palette.kangkong }}>
                {SCENARIOS[scenario].label.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Chart */}
          <View style={{ paddingHorizontal: 24 }}>
            <View
              style={{
                backgroundColor: c.surface,
                borderRadius: Radii.lg,
                padding: Spacing.lg,
                borderWidth: 1,
                borderColor: Borders.hairline[scheme],
              }}
              onLayout={(e) => setChartWidth(e.nativeEvent.layout.width - Spacing.lg * 2)}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: c.iconMuted, letterSpacing: 0.4, marginBottom: 12 }}>
                LIVE TREND
              </Text>
              {data.length > 1 && chartWidth > 0 ? (
                <LineChart
                  data={data}
                  width={chartWidth}
                  height={220}
                  color={Palette.kangkong}
                  baseline={avg}
                  showLabels
                />
              ) : (
                <View style={{ height: 220, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="watch-outline" size={32} color={c.iconMuted} />
                  <Text style={{ marginTop: 8, fontSize: 13, color: c.iconMuted }}>
                    {connection === 'disconnected' ? 'Smartwatch disconnected' : 'Collecting samples…'}
                  </Text>
                  {connection === 'disconnected' ? (
                    <Text
                      onPress={connect}
                      style={{
                        marginTop: 12,
                        color: Palette.kangkong,
                        fontWeight: '700',
                        fontSize: 13,
                      }}
                    >
                      Connect Smartwatch
                    </Text>
                  ) : null}
                </View>
              )}
            </View>
          </View>

          {/* Min/Avg/Max */}
          <View style={{ paddingHorizontal: 24, flexDirection: 'row', gap: 12 }}>
            <SmallStat label="Min" value={min} c={c} scheme={scheme} />
            <SmallStat label="Avg" value={avg} c={c} scheme={scheme} />
            <SmallStat label="Max" value={max} c={c} scheme={scheme} />
          </View>

          {/* Stress correlation */}
          <View style={{ paddingHorizontal: 24 }}>
            <View
              style={{
                backgroundColor: c.surface,
                borderRadius: Radii.lg,
                padding: Spacing.lg,
                borderWidth: 1,
                borderColor: Borders.hairline[scheme],
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Ionicons name="flash" size={16} color={stressColor} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: c.iconMuted, letterSpacing: 0.4 }}>
                  STRESS CORRELATION
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: c.text, lineHeight: 20 }}>
                Stress level is currently <Text style={{ color: stressColor, fontWeight: '700' }}>{stress}/100</Text>
                {stress >= 70
                  ? ' — your heart is responding to elevated stress.'
                  : stress >= 50
                  ? ' — slight tension; try a breath exercise.'
                  : ' — your nervous system looks relaxed.'}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function SmallStat({
  label,
  value,
  c,
  scheme,
}: {
  label: string;
  value: number;
  c: { text: string; iconMuted: string; surface: string };
  scheme: 'light' | 'dark';
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: c.surface,
        borderRadius: Radii.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Borders.hairline[scheme],
        alignItems: 'center',
      }}
    >
      <Text style={{ fontSize: 10, fontWeight: '700', color: c.iconMuted, letterSpacing: 0.4 }}>
        {label.toUpperCase()}
      </Text>
      <Text style={{ fontSize: 22, fontWeight: '700', color: c.text, marginTop: 4 }}>{value}</Text>
    </View>
  );
}
