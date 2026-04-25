import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { SleepTimeline } from '@/components/analytics/sleep-timeline';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Borders, Colors, Palette, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/features/hooks/use-color-scheme';
import { generateMockNight } from '@/features/sleep/generator';
import { useHealthStore } from '@/store/use-health-store';

export function SleepCard() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const router = useRouter();
  const connection = useHealthStore((s) => s.connection);
  const hasData = connection !== 'disconnected';
  const night = useMemo(() => (hasData ? generateMockNight() : null), [hasData]);

  return (
    <View style={{ paddingHorizontal: 24 }}>
      <PressableScale
        onPress={() => (hasData ? router.push('/sleep-detail') : undefined)}
        disabled={!hasData}
        style={{
          backgroundColor: c.surface,
          borderRadius: Radii.lg,
          padding: Spacing.lg,
          borderWidth: 1,
          borderColor: Borders.hairline[scheme],
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="moon" size={20} color={Palette.silverBlue} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: c.iconMuted, letterSpacing: 0.4 }}>
              LAST NIGHT&apos;S SLEEP
            </Text>
          </View>
          {hasData ? (
            <Ionicons name="chevron-forward" size={16} color={c.iconMuted} />
          ) : null}
        </View>

        {night ? (
          <>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                marginTop: 8,
              }}
            >
              <Text style={{ fontSize: 30, fontWeight: '700', color: c.text }}>
                {Math.floor(night.summary.durationMinutes / 60)}
                <Text style={{ fontSize: 14, fontWeight: '500', color: c.iconMuted }}>h</Text>{' '}
                {night.summary.durationMinutes % 60}
                <Text style={{ fontSize: 14, fontWeight: '500', color: c.iconMuted }}>m</Text>
              </Text>
              <View
                style={{
                  backgroundColor: Palette.silverBlue + '33',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: Radii.pill,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: Palette.silverBlue }}>
                  {night.summary.quality.toUpperCase()} · {night.summary.qualityScore}
                </Text>
              </View>
            </View>

            <View style={{ marginTop: 14 }}>
              <SleepTimeline night={night} height={48} showAxis />
            </View>
          </>
        ) : (
          <View style={{ paddingVertical: 18, alignItems: 'center' }}>
            <Text style={{ fontSize: 30, fontWeight: '700', color: c.text }}>
              0
              <Text style={{ fontSize: 14, fontWeight: '500', color: c.iconMuted }}>h</Text> 0
              <Text style={{ fontSize: 14, fontWeight: '500', color: c.iconMuted }}>m</Text>
            </Text>
            <Text style={{ fontSize: 12, color: c.iconMuted, marginTop: 6 }}>
              Connect smartwatch to log sleep
            </Text>
          </View>
        )}
      </PressableScale>
    </View>
  );
}
