import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

interface Props {
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
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
    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );

    const timeout = setTimeout(() => {
      anim.setValue(0);
      loop.start();
    }, delay);

    return () => {
      clearTimeout(timeout);
      loop.stop();
    };
  }, [anim, delay, duration]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -riseDistance],
  });

  const fade = anim.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, opacity, opacity, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left,
        bottom: 8,
        width: size,
        height: size,
        borderRadius: 9999,
        backgroundColor: 'rgba(255,255,255,0.9)',
        opacity: fade,
        transform: [{ translateY }],
      }}
    />
  );
}