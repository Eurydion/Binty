import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHabitsStore } from '@/store/use-habits-store';

/** Compact flame chip rendering the user's current overall habit streak. */
export function StreakChip() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  // Subscribe to logs/habits so re-renders happen when state changes;
  // overallStreak() is computed from current store state.
  useHabitsStore((s) => s.logs);
  useHabitsStore((s) => s.habits);
  const streak = useHabitsStore.getState().overallStreak();

  if (streak <= 0) return null;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 9999,
        backgroundColor: '#D9775722',
      }}
    >
      <Ionicons name="flame" size={13} color="#D97757" />
      <Text style={{ fontSize: 12, fontWeight: '800', color: c.text }}>{streak}</Text>
      <Text style={{ fontSize: 11, fontWeight: '600', color: c.iconMuted }}>
        day{streak === 1 ? '' : 's'}
      </Text>
    </View>
  );
}
