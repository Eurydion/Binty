import { Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { Colors } from '@/constants/theme';
import {
  STAGE_COLORS,
  STAGE_LABELS,
  STAGE_ORDER,
  type SleepNight,
  type SleepStage,
} from '@/features/sleep/types';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Props {
  night: SleepNight;
  size?: number;
  stroke?: number;
}

/**
 * Donut chart of sleep stage proportions. Uses stroke-dasharray on a
 * single-circumference circle per stage, rotated to its starting offset.
 */
export function SleepRing({ night, size = 180, stroke = 22 }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  const totals: Record<SleepStage, number> = {
    awake: night.summary.awake,
    light: night.summary.light,
    deep: night.summary.deep,
    rem: night.summary.rem,
  };
  const total = STAGE_ORDER.reduce((sum, s) => sum + totals[s], 0) || 1;

  let offset = 0;
  const arcs = STAGE_ORDER.map((stage) => {
    const frac = totals[stage] / total;
    const len = frac * circ;
    const node = (
      <Circle
        key={stage}
        cx={cx}
        cy={cy}
        r={radius}
        stroke={STAGE_COLORS[stage]}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={`${len} ${circ - len}`}
        strokeDashoffset={-offset}
        strokeLinecap="butt"
      />
    );
    offset += len;
    return { stage, frac, node };
  });

  const hours = Math.floor(night.summary.durationMinutes / 60);
  const mins = night.summary.durationMinutes % 60;

  return (
    <View style={{ alignItems: 'center', gap: 16 }}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          {/* track */}
          <Circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke={c.iconMuted + '22'}
            strokeWidth={stroke}
            fill="none"
          />
          {/* rotate so 0deg starts at top */}
          <G originX={cx} originY={cy} rotation={-90}>
            {arcs.map((a) => a.node)}
          </G>
        </Svg>
        <View
          style={{
            position: 'absolute',
            inset: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '700', color: c.iconMuted, letterSpacing: 0.5 }}>
            TOTAL
          </Text>
          <Text style={{ fontSize: 26, fontWeight: '700', color: c.text, marginTop: 2 }}>
            {hours}
            <Text style={{ fontSize: 13, fontWeight: '500', color: c.iconMuted }}>h</Text> {mins}
            <Text style={{ fontSize: 13, fontWeight: '500', color: c.iconMuted }}>m</Text>
          </Text>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: c.iconMuted,
              marginTop: 4,
              letterSpacing: 0.4,
            }}
          >
            {night.summary.quality.toUpperCase()} · {night.summary.qualityScore}
          </Text>
        </View>
      </View>

      {/* legend */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          rowGap: 8,
          columnGap: 14,
        }}
      >
        {STAGE_ORDER.map((stage) => {
          const m = totals[stage];
          const pct = Math.round((m / total) * 100);
          return (
            <View
              key={stage}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 9999,
                  backgroundColor: STAGE_COLORS[stage],
                }}
              />
              <Text style={{ fontSize: 12, fontWeight: '600', color: c.text }}>
                {STAGE_LABELS[stage]}
              </Text>
              <Text style={{ fontSize: 11, color: c.iconMuted }}>{pct}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
