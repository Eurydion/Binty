import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  bpm: number;
  active: boolean;
  size?: number;
  color: string;
  peak?: number;
}

export function PulseIcon({ bpm, active, size = 18, color, peak = 1.18 }: Props) {
  const scale = useSharedValue(1);
  const lastBpmRef = useRef(0);

  useEffect(() => {
    if (!active || bpm <= 0) {
      cancelAnimation(scale);
      scale.value = 1;
      lastBpmRef.current = 0;
      return;
    }
    if (Math.abs(bpm - lastBpmRef.current) < 2) return;
    lastBpmRef.current = bpm;
    const period = Math.max(300, Math.round(60000 / bpm));
    cancelAnimation(scale);
    scale.value = withRepeat(
      withTiming(peak, { duration: period / 2, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [bpm, active, peak, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={style}>
      <Ionicons name="heart" size={size} color={color} />
    </Animated.View>
  );
}
