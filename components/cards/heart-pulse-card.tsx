import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Sparkline } from '@/components/charts/sparkline';
import { PulseIcon } from '@/components/heart/pulse-icon';
import { StatusPill } from '@/components/heart/status-pill';
import { bpmStatus, trendFromHistory } from '@/components/heart/status-utils';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Borders, Colors, Palette, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHealthStore } from '@/store/use-health-store';

interface Props {
  bpm: number;
  variant?: 'compact' | 'detail';
}

/**
 * Heart-rate card.
 * - `compact` (default): square home tile that taps into /heart-rate.
 * - `detail`: bigger header used inside the dedicated heart-rate screen.
 *   Both variants share PulseIcon + StatusPill so we never duplicate
 *   pulse animation or status logic.
 */
export function HeartPulseCard({ bpm, variant = 'compact' }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const router = useRouter();
  const status = bpmStatus(bpm);
  const history = useHealthStore((s) => s.history);
  const connection = useHealthStore((s) => s.connection);
  const active = connection === 'connected';

  const bpmValues = history.map((h) => h.bpm);
  const trend = trendFromHistory(bpmValues);
  const trendIcon = trend === 'up' ? 'arrow-up' : trend === 'down' ? 'arrow-down' : 'remove';
  const trendColor =
    trend === 'up' ? Palette.kamote : trend === 'down' ? Palette.silverBlue : c.iconMuted;

  if (variant === 'detail') {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 12 }}>
        <View
          style={{
            width: 140,
            height: 140,
            borderRadius: 9999,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: status.color + '14',
          }}
        >
          <PulseIcon bpm={bpm} active={active} size={64} color={status.color} peak={1.25} />
        </View>
        <Text style={{ fontSize: 64, fontWeight: '700', color: c.text, marginTop: 12 }}>{bpm}</Text>
        <Text style={{ fontSize: 14, color: c.iconMuted, marginTop: -4, marginBottom: 8 }}>BPM</Text>
        <View style={{ alignItems: 'center' }}>
          <StatusPill label={status.label} color={status.color} size="md" />
        </View>
      </View>
    );
  }

  return (
    <PressableScale
      onPress={() => router.push('/heart-rate')}
      style={{
        flex: 1,
        aspectRatio: 1,
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: c.surface,
          borderRadius: Radii.lg,
          padding: Spacing.lg,
          borderWidth: 1,
          borderColor: Borders.hairline[scheme],
          justifyContent: 'space-between',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center', // 🔥 center everything
            gap: 3,
          }}
        >
          <PulseIcon bpm={bpm} active={active} size={20} color={status.color} />

          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: c.iconMuted,
              letterSpacing: 0.4,
            }}
          >
            HEART RATE
          </Text>

          <Ionicons name="chevron-forward" size={16} color={c.iconMuted} />
        </View>

        <View>
          <Text style={{ fontSize: 30, fontWeight: '700', color: c.text }}>
            {bpm}
            <Text style={{ fontSize: 13, fontWeight: '500', color: c.iconMuted }}> BPM</Text>
          </Text>
          {bpmValues.length > 1 ? (
            <View style={{ marginTop: 4 }}>
              <Sparkline
                data={bpmValues}
                color={status.color}
                width={90}
                height={20}
                yMin={40}
                yMax={180}
                windowSize={90}
              />
            </View>
          ) : null}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <StatusPill label={status.label} color={status.color} />
          <Ionicons name={trendIcon} size={13} color={trendColor} />
        </View>
      </View>
    </PressableScale>
  );
}
