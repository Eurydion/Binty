import { useMemo } from 'react';
import { Text, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';

import { Colors } from '@/constants/theme';
import { STAGE_COLORS, STAGE_ORDER, type SleepNight } from '@/features/sleep/types';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Props {
  night: SleepNight;
  height?: number;
  showAxis?: boolean;
}

/**
 * Hypnogram-style sleep visualization. Y axis maps to stage band (Awake at
 * top, Deep at bottom — clinical convention). The line is stepped (constant
 * stage for the duration of each segment, vertical jumps at transitions) and
 * each horizontal run is colored by that stage. We draw on a fixed 1000-wide
 * viewBox so segments scale with the container.
 */
export function SleepTimeline({ night, height = 80, showAxis = true }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  const VB_W = 1000;
  const VB_H = 100;
  const total = night.endMs - night.startMs;
  const bands = STAGE_ORDER.length; // [awake, rem, light, deep]
  const bandH = VB_H / bands;

  const yFor = (i: number) => i * bandH + bandH / 2;

  const { runs, gridYs } = useMemo(() => {
    const runs: { d: string; color: string }[] = [];
    let prevY: number | null = null;

    night.segments.forEach((seg) => {
      const x1 = ((seg.startMs - night.startMs) / total) * VB_W;
      const x2 = ((seg.endMs - night.startMs) / total) * VB_W;
      const yIndex = STAGE_ORDER.indexOf(seg.stage);
      const y = yFor(yIndex);
      const color = STAGE_COLORS[seg.stage];

      // vertical jump from previous stage (drawn in the new segment's color)
      const prefix = prevY != null && prevY !== y ? `M ${x1} ${prevY} L ${x1} ${y} ` : `M ${x1} ${y} `;
      runs.push({ d: `${prefix}L ${x2} ${y}`, color });
      prevY = y;
    });

    const gridYs = STAGE_ORDER.map((_, i) => yFor(i));
    return { runs, gridYs };
  }, [night.segments, night.startMs, total, bandH]);

  return (
    <View>
      {/* stage rail labels + chart */}
      <View style={{ flexDirection: 'row', height }}>
        <View style={{ width: 32, justifyContent: 'space-between', paddingVertical: 2 }}>
          {STAGE_ORDER.map((stage) => (
            <Text
              key={stage}
              style={{
                fontSize: 9,
                fontWeight: '700',
                color: STAGE_COLORS[stage],
                letterSpacing: 0.4,
              }}
            >
              {stage === 'awake' ? 'AWK' : stage === 'rem' ? 'REM' : stage === 'light' ? 'LGT' : 'DEP'}
            </Text>
          ))}
        </View>
        <View style={{ flex: 1, height }}>
          <Svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            preserveAspectRatio="none"
          >
            {gridYs.map((y, i) => (
              <Line
                key={i}
                x1={0}
                x2={VB_W}
                y1={y}
                y2={y}
                stroke={c.iconMuted}
                strokeOpacity={0.18}
                strokeWidth={0.5}
              />
            ))}
            {runs.map((r, i) => (
              <Path
                key={i}
                d={r.d}
                stroke={r.color}
                strokeWidth={2.4}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </Svg>
        </View>
      </View>
      {showAxis ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 4,
            paddingLeft: 32,
          }}
        >
          <Text style={{ fontSize: 10, color: c.iconMuted }}>{formatTime(night.startMs)}</Text>
          <Text style={{ fontSize: 10, color: c.iconMuted }}>{formatTime(night.endMs)}</Text>
        </View>
      ) : null}
    </View>
  );
}

function formatTime(ms: number): string {
  const d = new Date(ms);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}
