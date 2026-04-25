import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Borders, Colors, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/features/hooks/use-color-scheme';
import { useHabitsStore } from '@/store/use-habits-store';

export function HabitsStrip() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const router = useRouter();
  const habits = useHabitsStore((s) => s.habits);
  const logs = useHabitsStore((s) => s.logs);
  const increment = useHabitsStore((s) => s.increment);
  const countToday = useHabitsStore((s) => s.countToday);

  // Touch logs so the component re-renders when counts change without exposing
  // the helper to consumers (zustand selector returns a function reference).
  void logs;

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
          {habits.map((h) => {
            const count = countToday(h.id);
            const pct = Math.min(1, count / Math.max(1, h.target));
            const done = count >= h.target;
            return (
              <Pressable
                key={h.id}
                onPress={() => increment(h.id, 1)}
                onLongPress={() => router.push('/habits')}
                style={({ pressed }) => ({
                  width: 132,
                  borderRadius: Radii.lg,
                  padding: Spacing.md,
                  borderWidth: 1,
                  borderColor: done ? h.color : Borders.hairline[scheme],
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
                    backgroundColor: h.color,
                  }}
                />
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9999,
                    backgroundColor: h.color + '24',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}
                >
                  <Ionicons name={h.icon} size={16} color={h.color} />
                </View>
                <Text
                  style={{ fontSize: 13, fontWeight: '700', color: c.text }}
                  numberOfLines={1}
                >
                  {h.title}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: h.color }}>
                    {count}
                  </Text>
                  <Text style={{ fontSize: 11, color: c.iconMuted }}>
                    / {h.target} {h.unit}
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
                      backgroundColor: h.color,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
