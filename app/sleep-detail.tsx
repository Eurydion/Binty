import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SleepRing } from '@/components/analytics/sleep-ring';
import { SleepTimeline } from '@/components/analytics/sleep-timeline';
import { Borders, Colors, Palette, Radii, Spacing } from '@/constants/theme';
import { generateMockNight } from '@/features/sleep/generator';
import {
  STAGE_COLORS,
  STAGE_DESCRIPTIONS,
  STAGE_LABELS,
  STAGE_ORDER,
  type SleepStage,
} from '@/features/sleep/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHealthStore } from '@/store/use-health-store';

export default function SleepDetailScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const router = useRouter();
  const connection = useHealthStore((s) => s.connection);
  const hasData = connection !== 'disconnected';
  const night = useMemo(() => (hasData ? generateMockNight() : null), [hasData]);

  if (!night) {
    return (
      <>
        <Stack.Screen options={{ title: 'Sleep' }} />
        <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <Ionicons name="moon-outline" size={48} color={c.iconMuted} />
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: c.text,
                marginTop: 12,
              }}
            >
              No sleep data yet
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: c.iconMuted,
                marginTop: 6,
                textAlign: 'center',
                maxWidth: 260,
              }}
            >
              Connect your smartwatch from the Analytics tab to start tracking sleep stages.
            </Text>
            <Text
              onPress={() => router.back()}
              style={{
                marginTop: 18,
                color: Palette.kangkong,
                fontWeight: '700',
                fontSize: 13,
              }}
            >
              Go back
            </Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  const { summary } = night;
  const totals: Record<SleepStage, number> = {
    awake: summary.awake,
    light: summary.light,
    deep: summary.deep,
    rem: summary.rem,
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Sleep' }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
        <ScrollView contentContainerStyle={{ paddingVertical: 24, gap: 16 }}>
          {/* Hero ring */}
          <View style={{ paddingHorizontal: 24 }}>
            <View
              style={{
                backgroundColor: c.surface,
                borderRadius: Radii.lg,
                padding: Spacing.xl,
                borderWidth: 1,
                borderColor: Borders.hairline[scheme],
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: c.iconMuted,
                  letterSpacing: 0.4,
                  marginBottom: 16,
                  textAlign: 'center',
                }}
              >
                LAST NIGHT
              </Text>
              <SleepRing night={night} size={200} stroke={24} />
            </View>
          </View>

          {/* Hypnogram */}
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
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: c.iconMuted,
                  letterSpacing: 0.4,
                  marginBottom: 12,
                }}
              >
                HYPNOGRAM
              </Text>
              <SleepTimeline night={night} height={120} showAxis />
            </View>
          </View>

          {/* Stage explainers */}
          <View style={{ paddingHorizontal: 24, gap: 10 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: c.iconMuted,
                letterSpacing: 0.6,
                marginBottom: 4,
              }}
            >
              STAGES
            </Text>
            {STAGE_ORDER.map((stage) => {
              const mins = totals[stage];
              return (
                <View
                  key={stage}
                  style={{
                    backgroundColor: c.surface,
                    borderRadius: Radii.lg,
                    padding: Spacing.lg,
                    borderWidth: 1,
                    borderColor: Borders.hairline[scheme],
                    borderLeftWidth: 4,
                    borderLeftColor: STAGE_COLORS[stage],
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '700', color: c.text }}>
                      {STAGE_LABELS[stage]}
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: c.iconMuted }}>
                      {Math.floor(mins / 60) > 0 ? `${Math.floor(mins / 60)}h ` : ''}
                      {mins % 60}m
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 12,
                      lineHeight: 17,
                      color: c.iconMuted,
                      marginTop: 6,
                    }}
                  >
                    {STAGE_DESCRIPTIONS[stage]}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
