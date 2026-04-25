import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';

interface Props {
  color: string;
  /** Diameter of the burst halo. */
  size?: number;
}

const RAY_COUNT = 12;
const RAYS = Array.from({ length: RAY_COUNT }, (_, i) => (i / RAY_COUNT) * Math.PI * 2);

/**
 * Subtle radial ray burst behind a milestone toast. Rays expand and fade once,
 * matching the toast's calm 320ms in / 280ms out. Pure decoration; no input.
 */
export function MilestoneBurst({ color, size = 220 }: Props) {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 240, easing: Easing.linear });
    progress.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) });
    const t = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 360, easing: Easing.linear });
    }, 1900);
    return () => clearTimeout(t);
  }, [progress, opacity]);

  const wrapStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: 0.6 + progress.value * 0.6 }],
  }));

  const cx = size / 2;
  const innerR = size * 0.18;
  const outerR = size * 0.46;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        },
        wrapStyle,
      ]}
    >
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          {RAYS.map((angle, i) => {
            const x1 = cx + Math.cos(angle) * innerR;
            const y1 = cx + Math.sin(angle) * innerR;
            const x2 = cx + Math.cos(angle) * outerR;
            const y2 = cx + Math.sin(angle) * outerR;
            return (
              <Line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                opacity={0.55}
              />
            );
          })}
        </Svg>
      </View>
    </Animated.View>
  );
}
