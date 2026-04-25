import { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop, Circle, Line, Text as SvgText } from 'react-native-svg';

import { Palette } from '@/constants/theme';

interface Props {
  data: number[];
  width: number;
  height: number;
  color?: string;
  fillColor?: string;
  baseline?: number;
  showLabels?: boolean;
  paddingX?: number;
  paddingY?: number;
}

function buildPath(points: { x: number; y: number }[]): { line: string; area: string; lastPoint: { x: number; y: number } | null } {
  if (points.length === 0) return { line: '', area: '', lastPoint: null };
  if (points.length === 1) {
    const p = points[0];
    return { line: `M ${p.x} ${p.y}`, area: '', lastPoint: p };
  }
  let line = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const cur = points[i];
    const cx = (prev.x + cur.x) / 2;
    line += ` Q ${prev.x} ${prev.y} ${cx} ${(prev.y + cur.y) / 2}`;
    line += ` T ${cur.x} ${cur.y}`;
  }
  const last = points[points.length - 1];
  const first = points[0];
  return {
    line,
    area: `${line} L ${last.x} 100000 L ${first.x} 100000 Z`,
    lastPoint: last,
  };
}

export function LineChart({
  data,
  width,
  height,
  color = Palette.kangkong,
  fillColor,
  baseline,
  showLabels = false,
  paddingX = 12,
  paddingY = 16,
}: Props) {
  const fill = fillColor ?? color;

  const { points, min, max, avg, baselineY } = useMemo(() => {
    if (data.length === 0) {
      return { points: [], min: 0, max: 0, avg: 0, baselineY: null as number | null };
    }
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = Math.max(1, max - min);
    const innerW = width - paddingX * 2;
    const innerH = height - paddingY * 2;
    const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;
    const points = data.map((v, i) => ({
      x: paddingX + i * stepX,
      y: paddingY + innerH - ((v - min) / range) * innerH,
    }));
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    const baselineY = baseline != null
      ? paddingY + innerH - ((baseline - min) / range) * innerH
      : null;
    return { points, min, max, avg, baselineY };
  }, [data, width, height, paddingX, paddingY, baseline]);

  const { line, area, lastPoint } = useMemo(() => buildPath(points), [points]);

  return (
    <View>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="lc-fill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={fill} stopOpacity={0.25} />
            <Stop offset="1" stopColor={fill} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        {area ? <Path d={area} fill="url(#lc-fill)" /> : null}
        {baselineY != null ? (
          <Line
            x1={paddingX}
            x2={width - paddingX}
            y1={baselineY}
            y2={baselineY}
            stroke={color}
            strokeOpacity={0.25}
            strokeDasharray="4 4"
            strokeWidth={1}
          />
        ) : null}
        {line ? (
          <Path
            d={line}
            stroke={color}
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        {lastPoint ? (
          <>
            <Circle cx={lastPoint.x} cy={lastPoint.y} r={6} fill={color} fillOpacity={0.25} />
            <Circle cx={lastPoint.x} cy={lastPoint.y} r={3.5} fill={color} />
          </>
        ) : null}
        {showLabels && data.length > 0 ? (
          <>
            <SvgText x={paddingX} y={paddingY - 4} fontSize={10} fill={color} opacity={0.6}>
              max {Math.round(max)}
            </SvgText>
            <SvgText x={paddingX} y={height - 4} fontSize={10} fill={color} opacity={0.6}>
              min {Math.round(min)}
            </SvgText>
            <SvgText
              x={width - paddingX}
              y={height - 4}
              fontSize={10}
              fill={color}
              opacity={0.6}
              textAnchor="end"
            >
              avg {Math.round(avg)}
            </SvgText>
          </>
        ) : null}
      </Svg>
    </View>
  );
}
