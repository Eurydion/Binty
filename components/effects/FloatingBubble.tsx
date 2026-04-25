import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

interface Props {
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  /** How far up (in px) the bubble travels before disappearing. */
  riseDistance?: number;
}

export function FloatingBubble({
  left,
  size,
  duration,
  delay,
  opacity,
  riseDistance = 110,
}: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Use the JS driver so this animation stays in sync with the
    // parent water layer (which animates `height` with the JS driver).
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim, delay, duration]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -riseDistance],
  });

  const fade = anim.interpolate({
    inputRange: [0, 0.15, 0.85, 1],
    outputRange: [0, opacity, opacity, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left,
        bottom: 0,
        width: size,
        height: size,
        borderRadius: 9999,
        backgroundColor: 'rgba(255,255,255,0.75)',
        opacity: fade,
        transform: [{ translateY }],
      }}
    />
  );
}
