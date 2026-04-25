import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Sparkline } from '@/components/charts/sparkline';
import { Borders, Colors, Palette, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHealthStore } from '@/store/use-health-store';

interface Props {
  bpm: number;
}

function getStatus(bpm: number): { label: string; color: string } {
  if (bpm < 60) return { label: 'Low', color: Palette.silverBlue };
  if (bpm <= 100) return { label: 'Normal', color: Palette.kangkong };
  if (bpm <= 120) return { label: 'Elevated', color: Palette.kamote };
  return { label: 'High', color: '#D97757' };
}

function trendFromHistory(values: number[]): 'up' | 'down' | 'flat' {
  if (values.length < 4) return 'flat';
  const half = Math.floor(values.length / 2);
  const a = values.slice(0, half).reduce((s, v) => s + v, 0) / half;
  const b = values.slice(half).reduce((s, v) => s + v, 0) / (values.length - half);
  if (b - a > 3) return 'up';
  if (a - b > 3) return 'down';
  return 'flat';
}

export function HeartPulseCard({ bpm }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const router = useRouter();
  const status = getStatus(bpm);
  const history = useHealthStore((s) => s.history);
  const connection = useHealthStore((s) => s.connection);

  const bpmValues = history.map((h) => h.bpm);
  const trend = trendFromHistory(bpmValues);

  const scale = useSharedValue(1);
  const lastBpmRef = useRef(0);
  useEffect(() => {
    if (connection !== 'connected' || bpm <= 0) {
      cancelAnimation(scale);
      scale.value = 1;
      lastBpmRef.current = 0;
      return;
    }
    // skip restart on tiny jitter
    if (Math.abs(bpm - lastBpmRef.current) < 2) return;
    lastBpmRef.current = bpm;
    const period = Math.max(300, Math.round(60000 / bpm));
    cancelAnimation(scale);
    scale.value = withRepeat(
      withTiming(1.18, { duration: period / 2, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [bpm, connection, scale]);

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const trendIcon = trend === 'up' ? 'arrow-up' : trend === 'down' ? 'arrow-down' : 'remove';
  const trendColor =
    trend === 'up' ? Palette.kamote : trend === 'down' ? Palette.silverBlue : c.iconMuted;

  return (
    <Pressable
      onPress={() => router.push('/heart-rate')}
      style={({ pressed }) => ({
        flex: 1,
        aspectRatio: 1,
        opacity: pressed ? 0.9 : 1,
      })}
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
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Animated.View style={pulseStyle}>
              <Ionicons name="heart" size={18} color={status.color} />
            </Animated.View>
            <Text style={{ fontSize: 11, fontWeight: '700', color: c.iconMuted, letterSpacing: 0.4 }}>
              HEART RATE
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={14} color={c.iconMuted} />
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
          <View
            style={{
              backgroundColor: status.color + '22',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: Radii.pill,
            }}
          >
            <Text style={{ color: status.color, fontSize: 11, fontWeight: '700' }}>
              {status.label}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Ionicons name={trendIcon} size={11} color={trendColor} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}
