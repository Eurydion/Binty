import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Sparkline } from '@/components/charts/sparkline';
import { Borders, Colors, Palette, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  unit?: string;
  trend?: 'up' | 'down' | 'flat';
  trendLabel?: string;
  data?: number[];
  color?: string;
  yMin?: number;
  yMax?: number;
  windowSize?: number;
}

export function MetricCard({
  icon,
  label,
  value,
  unit,
  trend = 'flat',
  trendLabel,
  data,
  color = Palette.kangkong,
  yMin,
  yMax,
  windowSize,
}: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  const trendIcon = trend === 'up' ? 'arrow-up' : trend === 'down' ? 'arrow-down' : 'remove';
  const trendColor =
    trend === 'up' ? Palette.kamote : trend === 'down' ? Palette.silverBlue : c.iconMuted;

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
        <Ionicons name={icon} size={16} color={color} />
        <Text style={{ fontSize: 11, fontWeight: '700', color: c.iconMuted, letterSpacing: 0.4 }}>
          {label.toUpperCase()}
        </Text>
      </View>

      <View>
        <Text style={{ fontSize: 26, fontWeight: '700', color: c.text }}>
          {value}
          {unit ? (
            <Text style={{ fontSize: 12, fontWeight: '500', color: c.iconMuted }}> {unit}</Text>
          ) : null}
        </Text>
        {data && data.length > 1 ? (
          <View style={{ marginTop: 4 }}>
            <Sparkline
              data={data}
              color={color}
              width={80}
              height={20}
              yMin={yMin}
              yMax={yMax}
              windowSize={windowSize}
            />
          </View>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Ionicons name={trendIcon} size={11} color={trendColor} />
        <Text style={{ fontSize: 11, fontWeight: '600', color: trendColor }}>
          {trendLabel ?? (trend === 'flat' ? 'steady' : trend === 'up' ? 'rising' : 'falling')}
        </Text>
      </View>
    </View>
  );
}
