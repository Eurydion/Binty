import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { SleepTimeline } from '@/components/analytics/sleep-timeline';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Borders, Colors, Palette, Radii, Spacing } from '@/constants/theme';
import { generateMockNight } from '@/features/sleep/generator';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function SleepCard() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const router = useRouter();
  const night = useMemo(() => generateMockNight(), []);
  const { summary } = night;
  const hours = Math.floor(summary.durationMinutes / 60);
  const mins = summary.durationMinutes % 60;

  return (
    <View style={{ paddingHorizontal: 24 }}>
      <PressableScale
        onPress={() => router.push('/sleep-detail')}
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
          <Ionicons name="chevron-forward" size={16} color={c.iconMuted} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 8 }}>
          <Text style={{ fontSize: 30, fontWeight: '700', color: c.text }}>
            {hours}
            <Text style={{ fontSize: 14, fontWeight: '500', color: c.iconMuted }}>h</Text> {mins}
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
              {summary.quality.toUpperCase()} · {summary.qualityScore}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 14 }}>
          <SleepTimeline night={night} height={48} showAxis />
        </View>
      </PressableScale>
    </View>
  );
}
