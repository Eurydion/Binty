import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Borders, Colors, Radii, Spacing } from '@/constants/theme';
import type { Habit } from '@/features/habits/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDate } from '@/lib/date';
import { useHabitsStore } from '@/store/use-habits-store';

function HabitChip({ habit, today }: { habit: Habit; today: string }) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const router = useRouter();
  const count = useHabitsStore((s) => s.logs[habit.id]?.[today] ?? 0);
  const increment = useHabitsStore((s) => s.increment);

  const pct = Math.min(1, count / Math.max(1, habit.target));
  const done = count >= habit.target;

  return (
    <Pressable
      onPress={() => increment(habit.id, 1)}
      onLongPress={() => router.push('/habits')}
      style={({ pressed }) => ({
        width: 132,
        borderRadius: Radii.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: done ? habit.color : Borders.hairline[scheme],
        backgroundColor: c.surface,
        overflow: 'hidden',
        opacity: pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          height: 3,
          width: `${pct * 100}%`,
          backgroundColor: habit.color,
        }}
      />
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 9999,
          backgroundColor: habit.color + '24',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}
      >
        <Ionicons name={habit.icon} size={16} color={habit.color} />
      </View>
      <Text
        style={{ fontSize: 13, fontWeight: '700', color: c.text }}
        numberOfLines={1}
      >
        {habit.title}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
        <Text style={{ fontSize: 16, fontWeight: '800', color: habit.color }}>
          {count}
        </Text>
        <Text style={{ fontSize: 11, color: c.iconMuted }}>
          / {habit.target} {habit.unit}
        </Text>
      </View>
      {done ? (
        <View
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 18,
            height: 18,
            borderRadius: 9999,
            backgroundColor: habit.color,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="checkmark" size={12} color="#fff" />
        </View>
      ) : null}
    </Pressable>
  );
}

export function HabitsStrip() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const router = useRouter();
  const habits = useHabitsStore((s) => s.habits);
  const today = formatDate(new Date());

  return (
    <View style={{ paddingHorizontal: 24 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            fontSize: 11,
            fontWeight: '800',
            letterSpacing: 0.7,
            color: c.iconMuted,
            textTransform: 'uppercase',
          }}
        >
          Micro-habits
        </Text>
        <Pressable
          onPress={() => router.push('/habits')}
          hitSlop={8}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: c.text }}>
            {habits.length === 0 ? 'Add' : 'Manage'}
          </Text>
          <Ionicons name="chevron-forward" size={14} color={c.text} />
        </Pressable>
      </View>

      {habits.length === 0 ? (
        <Pressable
          onPress={() => router.push('/habits')}
          style={({ pressed }) => ({
            borderRadius: Radii.lg,
            padding: Spacing.lg,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: Borders.hairline[scheme],
            backgroundColor: c.surface,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 9999,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: c.background,
            }}
          >
            <Ionicons name="add" size={20} color={c.text} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: c.text }}>
              Track a tiny habit
            </Text>
            <Text style={{ fontSize: 12, color: c.iconMuted, marginTop: 2 }}>
              1 glass of water, 2-min stretch — start small.
            </Text>
          </View>
        </Pressable>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingRight: 4 }}
        >
          {habits.map((h) => (
            <HabitChip key={h.id} habit={h} today={today} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
