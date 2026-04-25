import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Borders, Colors, Palette, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Segment {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  unit?: string;
  trend: 'up' | 'down' | 'flat';
  deltaPct?: number;
  color: string;
}

interface Props {
  segments: Segment[];
}

/**
 * Single full-width metrics card. Each segment shows value + label + a tiny
 * trend chip. No charts — kept clean for at-a-glance scanning.
 */
export function KeyMetricsStrip({ segments }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  return (
    <View style={{ paddingHorizontal: 24 }}>
      <View
        style={{
          backgroundColor: c.surface,
          borderRadius: Radii.lg,
          borderWidth: 1,
          borderColor: Borders.hairline[scheme],
          flexDirection: 'row',
          paddingVertical: Spacing.lg,
        }}
      >
        {segments.map((s, i) => (
          <View
            key={s.label}
            style={{
              flex: 1,
              paddingHorizontal: Spacing.md,
              borderLeftWidth: i === 0 ? 0 : 1,
              borderLeftColor: Borders.hairline[scheme],
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name={s.icon} size={14} color={s.color} />
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '700',
                  color: c.iconMuted,
                  letterSpacing: 0.6,
                }}
              >
                {s.label.toUpperCase()}
              </Text>
            </View>
            <Text style={{ fontSize: 26, fontWeight: '700', color: c.text }}>
              {s.value}
              {s.unit ? (
                <Text style={{ fontSize: 11, fontWeight: '500', color: c.iconMuted }}>
                  {' '}
                  {s.unit}
                </Text>
              ) : null}
            </Text>
            <TrendChip trend={s.trend} deltaPct={s.deltaPct} c={c} />
          </View>
        ))}
      </View>
    </View>
  );
}

function TrendChip({
  trend,
  deltaPct,
  c,
}: {
  trend: Segment['trend'];
  deltaPct?: number;
  c: { iconMuted: string };
}) {
  const icon = trend === 'up' ? 'arrow-up' : trend === 'down' ? 'arrow-down' : 'remove';
  const color =
    trend === 'up' ? Palette.kamote : trend === 'down' ? Palette.silverBlue : c.iconMuted;
  const label =
    deltaPct != null
      ? `${trend === 'flat' ? '±' : ''}${Math.abs(Math.round(deltaPct))}%`
      : trend === 'flat'
      ? 'steady'
      : trend;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      <Ionicons name={icon} size={10} color={color} />
      <Text style={{ fontSize: 10, fontWeight: '700', color }}>{label}</Text>
    </View>
  );
}

export function pctDelta(values: number[]): number {
  if (values.length < 4) return 0;
  const half = Math.floor(values.length / 2);
  const a = values.slice(0, half).reduce((s, v) => s + v, 0) / half;
  const b = values.slice(half).reduce((s, v) => s + v, 0) / (values.length - half);
  if (a === 0) return 0;
  return ((b - a) / Math.abs(a)) * 100;
}

export function trendOf(values: number[], threshold = 2): 'up' | 'down' | 'flat' {
  if (values.length < 4) return 'flat';
  const half = Math.floor(values.length / 2);
  const a = values.slice(0, half).reduce((s, v) => s + v, 0) / half;
  const b = values.slice(half).reduce((s, v) => s + v, 0) / (values.length - half);
  if (b - a > threshold) return 'up';
  if (a - b > threshold) return 'down';
  return 'flat';
}
