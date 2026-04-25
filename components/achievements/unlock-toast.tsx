import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { MilestoneBurst } from '@/components/achievements/milestone-burst';
import { Borders, Colors, Palette, Radii, Spacing } from '@/constants/theme';
import { ACHIEVEMENTS_BY_ID } from '@/features/achievements/catalog';
import { useColorScheme } from '@/features/hooks/use-color-scheme';

interface Props {
  achievementId: string;
  onDone: () => void;
}

/**
 * Linear slide-down toast. No springs — simple ease in/out timing for a
 * calm, non-bouncy feel. Auto-dismisses after ~2.5s.
 */
export function UnlockToast({ achievementId, onDone }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const a = ACHIEVEMENTS_BY_ID[achievementId];

  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withTiming(0, { duration: 320, easing: Easing.out(Easing.cubic) });
    opacity.value = withTiming(1, { duration: 220, easing: Easing.linear });
    const t = setTimeout(() => {
      translateY.value = withTiming(-120, { duration: 280, easing: Easing.in(Easing.cubic) });
      opacity.value = withTiming(0, { duration: 240, easing: Easing.linear });
      setTimeout(onDone, 320);
    }, 2300);
    return () => clearTimeout(t);
  }, [achievementId, translateY, opacity, onDone]);

  const wrapStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!a) return null;

  const isMilestone = achievementId.startsWith('streak-');

  return (
    <>
      {isMilestone ? (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: 12,
              left: 0,
              right: 0,
              alignItems: 'center',
            },
            wrapStyle,
          ]}
        >
          <MilestoneBurst color={a.color} />
        </Animated.View>
      ) : null}
      <Animated.View
        pointerEvents="none"
        style={[
        {
          position: 'absolute',
          top: 56,
          left: 24,
          right: 24,
          backgroundColor: c.surface,
          borderRadius: Radii.lg,
          padding: Spacing.md,
          borderWidth: 1,
          borderColor: Borders.hairline[scheme],
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        },
        wrapStyle,
      ]}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 9999,
          backgroundColor: a.color + '22',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={a.icon} size={22} color={a.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 10,
            fontWeight: '700',
            color: Palette.kangkong,
            letterSpacing: 0.6,
          }}
        >
          ACHIEVEMENT UNLOCKED
        </Text>
        <Text style={{ fontSize: 14, fontWeight: '700', color: c.text, marginTop: 2 }}>
          {a.title}
        </Text>
        <Text style={{ fontSize: 11, color: c.iconMuted, marginTop: 1 }} numberOfLines={1}>
          {a.description}
        </Text>
      </View>
    </Animated.View>
    </>
  );
}
