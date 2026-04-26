import { useEffect, useRef } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { getMascotComponent } from '@/features/mascot/mascot-map';
import { Motion } from '@/constants/theme';
import type { EmotionalState } from '@/types/health';

interface Props {
  state: EmotionalState;
  size?: number;
}

export function MascotPortrait({ state, size = 96 }: Props) {
  const SvgComponent = getMascotComponent(state);
  const prevState = useRef(state);

  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (prevState.current !== state) {
      prevState.current = state;
      const dur = Motion.timing.base;
      const ease = Easing.out(Easing.quad);

      // fade out → swap → fade in + gentle bounce
      opacity.value = withSequence(
        withTiming(0, { duration: dur, easing: ease }),
        withTiming(1, { duration: dur, easing: ease }),
      );
      scale.value = withSequence(
        withTiming(0.85, { duration: dur, easing: ease }),
        withTiming(1.05, { duration: dur * 0.6, easing: ease }),
        withTiming(1, { duration: dur * 0.4, easing: ease }),
      );
    }
  }, [state, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        },
        animatedStyle,
      ]}
      accessibilityRole="image"
      accessibilityLabel={`Binty mascot — ${state}`}
    >
      <SvgComponent width={size} height={size} />
    </Animated.View>
  );
}
