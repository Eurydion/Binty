import { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

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
  /** Fixed Y range so existing samples never reposition vertically. */
  yMin?: number;
  yMax?: number;
  /** How many sample slots fit on the X axis. Default = data.length. */
  windowSize?: number;
  /** Slide animation duration. Should match (or be slightly less than) tick interval. */
  animateMs?: number;
}

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const cur = points[i];
    const mx = (prev.x + cur.x) / 2;
    const my = (prev.y + cur.y) / 2;
    d += ` Q ${prev.x} ${prev.y} ${mx} ${my}`;
    d += ` T ${cur.x} ${cur.y}`;
  }
  return d;
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
  yMin,
  yMax,
  windowSize,
  animateMs = 950,
}: Props) {
  const fill = fillColor ?? color;

  const W = Math.max(2, windowSize ?? data.length);
  const innerW = width - paddingX * 2;
  const innerH = height - paddingY * 2;
  const stepX = innerW / (W - 1);

  const lo = yMin ?? (data.length ? Math.min(...data) : 0);
  const hi = yMax ?? (data.length ? Math.max(...data) : 1);
  const range = Math.max(1, hi - lo);

  const { points, dLine, dArea, lastPoint, observed } = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < data.length; i++) {
      const reverseIdx = data.length - 1 - i; // 0 = newest
      const x = (width - paddingX) - reverseIdx * stepX;
      const v = Math.max(lo, Math.min(hi, data[i]));
      const y = paddingY + innerH - ((v - lo) / range) * innerH;
      pts.push({ x, y });
    }
    const dLine = buildSmoothPath(pts);
    let dArea = '';
    if (pts.length >= 2) {
      const last = pts[pts.length - 1];
      const first = pts[0];
      const baseY = height - paddingY;
      dArea = `${dLine} L ${last.x} ${baseY} L ${first.x} ${baseY} Z`;
    }
    const lastPoint = pts.length ? pts[pts.length - 1] : null;
    const observed = data.length
      ? { min: Math.min(...data), max: Math.max(...data), avg: data.reduce((a, b) => a + b, 0) / data.length }
      : { min: 0, max: 0, avg: 0 };
    return { points: pts, dLine, dArea, lastPoint, observed };
  }, [data, width, height, paddingX, paddingY, stepX, innerH, lo, hi, range]);

  // ECG scroll: each new sample, content starts shifted right by stepX,
  // then animates back to 0. Newest point slides in from the right edge.
  const animX = useSharedValue(0);
  const lastLenRef = useRef(0);
  const lastTailRef = useRef<number | null>(null);
  useEffect(() => {
    if (data.length === 0) return;
    const tail = data[data.length - 1];
    const isNewSample =
      data.length !== lastLenRef.current || tail !== lastTailRef.current;
    lastLenRef.current = data.length;
    lastTailRef.current = tail;
    if (!isNewSample) return;
    if (lastLenRef.current <= 1) {
      animX.value = 0;
      return;
    }
    animX.value = stepX;
    animX.value = withTiming(0, { duration: animateMs, easing: Easing.linear });
  }, [data, stepX, animateMs, animX]);

  const wrapStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: animX.value }],
  }));

  const baselineY =
    baseline != null
      ? paddingY + innerH - ((Math.max(lo, Math.min(hi, baseline)) - lo) / range) * innerH
      : null;

  // SVG is wider than the visible View so the off-screen newest point has room.
  const svgW = width + stepX;

  return (
    <View style={{ width, height, overflow: 'hidden' }}>
      <Animated.View style={[{ width: svgW, height }, wrapStyle]}>
        <Svg width={svgW} height={height}>
          <Defs>
            <LinearGradient id="lc-fill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={fill} stopOpacity={0.25} />
              <Stop offset="1" stopColor={fill} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          {dArea ? <Path d={dArea} fill="url(#lc-fill)" /> : null}
          {baselineY != null ? (
            <Line
              x1={paddingX}
              x2={svgW - paddingX}
              y1={baselineY}
              y2={baselineY}
              stroke={color}
              strokeOpacity={0.25}
              strokeDasharray="4 4"
              strokeWidth={1}
            />
          ) : null}
          {dLine ? (
            <Path
              d={dLine}
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
        </Svg>
      </Animated.View>

      {showLabels && data.length > 0 ? (
        <Svg
          width={width}
          height={height}
          style={{ position: 'absolute', left: 0, top: 0 }}
          pointerEvents="none"
        >
          <SvgText x={paddingX} y={paddingY - 4} fontSize={10} fill={color} opacity={0.6}>
            max {Math.round(observed.max)}
          </SvgText>
          <SvgText x={paddingX} y={height - 4} fontSize={10} fill={color} opacity={0.6}>
            min {Math.round(observed.min)}
          </SvgText>
          <SvgText
            x={width - paddingX}
            y={height - 4}
            fontSize={10}
            fill={color}
            opacity={0.6}
            textAnchor="end"
          >
            avg {Math.round(observed.avg)}
          </SvgText>
        </Svg>
      ) : null}
    </View>
  );
}
