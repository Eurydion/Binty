import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Borders, Colors, Palette, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { SleepData } from '@/types/health';

interface Props {
  sleep: SleepData | null;
}

const QUALITY_SCORE = { poor: 40, fair: 70, good: 90 } as const;

export function SleepCard({ sleep }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  if (!sleep) {
    return (
      <View
        style={{
          flex: 1,
          aspectRatio: 1,
          backgroundColor: c.surface,
          borderRadius: Radii.lg,
          padding: Spacing.lg,
          borderWidth: 1,
          borderColor: Borders.hairline[scheme],
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: c.iconMuted, fontSize: 12 }}>No sleep data</Text>
      </View>
    );
  }

  const hours = Math.floor(sleep.durationMinutes / 60);
  const mins = sleep.durationMinutes % 60;
  const score = QUALITY_SCORE[sleep.quality];
  const total = Math.max(1, sleep.durationMinutes);
  const deepPct = sleep.deepSleepMinutes / total;
  const remPct = sleep.remSleepMinutes / total;

  return (
    <View
      style={{
        flex: 1,
        aspectRatio: 1,
        backgroundColor: c.surface,
        borderRadius: Radii.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Borders.hairline[scheme],
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Ionicons name="moon" size={16} color={Palette.silverBlue} />
        <Text style={{ fontSize: 11, fontWeight: '700', color: c.iconMuted, letterSpacing: 0.4 }}>
          SLEEP
        </Text>
      </View>

      <View>
        <Text style={{ fontSize: 26, fontWeight: '700', color: c.text }}>
          {hours}
          <Text style={{ fontSize: 14, fontWeight: '500', color: c.iconMuted }}>h</Text>
          {' '}
          {mins}
          <Text style={{ fontSize: 14, fontWeight: '500', color: c.iconMuted }}>m</Text>
        </Text>
        <View
          style={{
            alignSelf: 'flex-start',
            marginTop: 4,
            backgroundColor: Palette.silverBlue + '33',
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: Radii.pill,
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: '700', color: Palette.silverBlue }}>
            {sleep.quality.toUpperCase()} · {score}
          </Text>
        </View>
      </View>

      <View style={{ gap: 6 }}>
        <Bar label="Deep" pct={deepPct} color={Palette.kangkong} scheme={scheme} />
        <Bar label="REM" pct={remPct} color={Palette.silverBlue} scheme={scheme} />
      </View>
    </View>
  );
}

function Bar({
  label,
  pct,
  color,
  scheme,
}: {
  label: string;
  pct: number;
  color: string;
  scheme: 'light' | 'dark';
}) {
  const c = Colors[scheme];
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
        <Text style={{ fontSize: 10, color: c.iconMuted, fontWeight: '600' }}>{label}</Text>
        <Text style={{ fontSize: 10, color: c.iconMuted }}>{Math.round(pct * 100)}%</Text>
      </View>
      <View
        style={{
          height: 4,
          borderRadius: 9999,
          backgroundColor: Borders.hairline[scheme],
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${Math.min(100, Math.max(0, pct * 100))}%`,
            height: '100%',
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
}
