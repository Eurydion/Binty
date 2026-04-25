import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Colors, Radii } from '@/constants/theme';
import type { Achievement } from '@/features/achievements/types';
import { useColorScheme } from '@/features/hooks/use-color-scheme';

interface Props {
  achievement: Achievement;
  unlocked: boolean;
  size?: number;
}

export function AchievementBadge({ achievement, unlocked, size = 84 }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const inner = size - 10;
  const fill = unlocked ? '#FFFFFF' : c.iconMuted;
  const innerBg = unlocked ? achievement.color : c.surface;
  const ring = achievement.color;

  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: 9999,
          padding: 3,
          backgroundColor: unlocked ? ring : c.surface,
          opacity: unlocked ? 1 : 0.6,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: unlocked ? achievement.color : 'transparent',
          shadowOpacity: unlocked ? 0.35 : 0,
          shadowRadius: unlocked ? 10 : 0,
          shadowOffset: { width: 0, height: 4 },
          elevation: unlocked ? 4 : 0,
        }}
      >
        <View
          style={{
            width: inner,
            height: inner,
            borderRadius: 9999,
            backgroundColor: innerBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={achievement.icon} size={inner * 0.42} color={fill} />
          {!unlocked ? (
            <View
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                backgroundColor: c.surface,
                borderRadius: 9999,
                padding: 3,
              }}
            >
              <Ionicons name="lock-closed" size={10} color={c.iconMuted} />
            </View>
          ) : null}
        </View>
      </View>
      <Text
        style={{
          fontSize: 11,
          fontWeight: '600',
          color: unlocked ? c.text : c.iconMuted,
          textAlign: 'center',
          maxWidth: size + 12,
        }}
        numberOfLines={2}
      >
        {achievement.title}
      </Text>
      <View
        style={{
          backgroundColor: ring + (unlocked ? '33' : '11'),
          paddingHorizontal: 6,
          paddingVertical: 1,
          borderRadius: Radii.pill,
        }}
      >
        <Text
          style={{ fontSize: 9, fontWeight: '700', color: ring, letterSpacing: 0.4 }}
        >
          +{achievement.points} PTS
        </Text>
      </View>
    </View>
  );
}
