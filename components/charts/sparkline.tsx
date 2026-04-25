import { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Palette } from '@/constants/theme';

interface Props {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  yMin?: number;
  yMax?: number;
  windowSize?: number;
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

export function Sparkline({
  data,
  width = 60,
  height = 22,
  color = Palette.kangkong,
  yMin,
  yMax,
  windowSize,
  animateMs = 950,
}: Props) {
  const W = Math.max(2, windowSize ?? data.length);
  const stepX = width / (W - 1);

  const lo = yMin ?? (data.length ? Math.min(...data) : 0);
  const hi = yMax ?? (data.length ? Math.max(...data) : 1);
  const range = Math.max(1, hi - lo);

  const d = useMemo(() => {
    const pts = data.map((v, i) => {
      const reverseIdx = data.length - 1 - i;
      const x = width - reverseIdx * stepX;
      const clamped = Math.max(lo, Math.min(hi, v));
      const y = height - ((clamped - lo) / range) * (height - 2) - 1;
      return { x, y };
    });
    return buildSmoothPath(pts);
  }, [data, width, height, stepX, lo, hi, range]);

  const animX = useSharedValue(0);
  const lastLenRef = useRef(0);
  const lastTailRef = useRef<number | null>(null);
  useEffect(() => {
    if (data.length === 0) return;
    const tail = data[data.length - 1];
    const isNew = data.length !== lastLenRef.current || tail !== lastTailRef.current;
    lastLenRef.current = data.length;
    lastTailRef.current = tail;
    if (!isNew) return;
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

  const svgW = width + stepX;

  return (
    <View style={{ width, height, overflow: 'hidden' }}>
      <Animated.View style={[{ width: svgW, height }, wrapStyle]}>
        <Svg width={svgW} height={height}>
          {d ? (
            <Path
              d={d}
              stroke={color}
              strokeWidth={1.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
        </Svg>
      </Animated.View>
    </View>
  );
}
