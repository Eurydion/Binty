import { ReactNode } from 'react';
import { Pressable, type PressableProps, type ViewStyle, type StyleProp } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Motion } from '@/constants/theme';

interface Props extends PressableProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Scale to shrink to on press. Default 0.97. */
  pressedScale?: number;
}

/**
 * Tactile press wrapper — shrinks slightly on press with a soft spring.
 * Drop-in replacement for Pressable for any tappable surface.
 */
export function PressableScale({
  children,
  style,
  pressedScale = 0.97,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={(e) => {
        scale.value = withSpring(pressedScale, Motion.spring.soft);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, Motion.spring.soft);
        onPressOut?.(e);
      }}
      {...rest}
    >
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}
