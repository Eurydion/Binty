import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Borders, Colors, Radii, Spacing } from '@/constants/theme';
import { HABIT_PRESETS } from '@/features/habits/presets';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MAX_ACTIVE_HABITS, useHabitsStore } from '@/store/use-habits-store';

export default function HabitsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const router = useRouter();

  const habits = useHabitsStore((s) => s.habits);
  const addFromPreset = useHabitsStore((s) => s.addFromPreset);
  const addCustom = useHabitsStore((s) => s.addCustom);
  const removeHabit = useHabitsStore((s) => s.removeHabit);
  const countToday = useHabitsStore((s) => s.countToday);
  const currentStreak = useHabitsStore((s) => s.currentStreak);

  const [showCustom, setShowCustom] = useState(false);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('1');
  const [unit, setUnit] = useState('time');

  const atCap = habits.length >= MAX_ACTIVE_HABITS;
  const activeIds = new Set(habits.map((h) => h.id));

  const submitCustom = () => {
    const t = title.trim();
    const n = Math.max(1, Math.min(99, Number(target) || 1));
    if (!t) return;
    addCustom({
      title: t,
      target: n,
      unit: unit.trim() || 'time',
      icon: 'star',
      color: '#7B68EE',
      category: 'custom',
    });
    setTitle('');
    setTarget('1');
    setUnit('time');
    setShowCustom(false);
  };

  const confirmRemove = (id: string, name: string) => {
    Alert.alert('Remove habit?', `“${name}” will be removed. Logs are kept.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeHabit(id) },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 64, gap: 16 }}>
        <Text style={{ fontSize: 13, color: c.iconMuted }}>
          Tiny habits beat big resolutions. Keep targets small. Up to {MAX_ACTIVE_HABITS} active at a time.
        </Text>

        {/* Active habits */}
        {habits.length > 0 ? (
          <View style={{ gap: 10 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '800',
                letterSpacing: 0.7,
                color: c.iconMuted,
                textTransform: 'uppercase',
              }}
            >
              Active ({habits.length}/{MAX_ACTIVE_HABITS})
            </Text>
            {habits.map((h) => {
              const today = countToday(h.id);
              const streak = currentStreak(h.id);
              return (
                <View
                  key={h.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: Spacing.md,
                    borderRadius: Radii.lg,
                    borderWidth: 1,
                    borderColor: Borders.hairline[scheme],
                    backgroundColor: c.surface,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 9999,
                      backgroundColor: h.color + '24',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name={h.icon} size={20} color={h.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: c.text }}>
                      {h.title}
                    </Text>
                    <Text style={{ fontSize: 12, color: c.iconMuted, marginTop: 2 }}>
                      {today}/{h.target} {h.unit} today
                      {streak > 0 ? `  •  🔥 ${streak}d` : ''}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => confirmRemove(h.id, h.title)}
                    hitSlop={10}
                    style={({ pressed }) => ({
                      width: 32,
                      height: 32,
                      borderRadius: 9999,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: pressed ? 0.6 : 1,
                    })}
                  >
                    <Ionicons name="trash-outline" size={16} color={c.iconMuted} />
                  </Pressable>
                </View>
              );
            })}
          </View>
        ) : null}

        {/* Presets */}
        <View style={{ gap: 10 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '800',
              letterSpacing: 0.7,
              color: c.iconMuted,
              textTransform: 'uppercase',
            }}
          >
            Quick add
          </Text>
          {HABIT_PRESETS.map((p) => {
            const added = activeIds.has(p.id);
            const disabled = added || atCap;
            return (
              <Pressable
                key={p.id}
                disabled={disabled}
                onPress={() => addFromPreset(p)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: Spacing.md,
                  borderRadius: Radii.lg,
                  borderWidth: 1,
                  borderColor: Borders.hairline[scheme],
                  backgroundColor: c.surface,
                  opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
                })}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9999,
                    backgroundColor: p.color + '24',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name={p.icon} size={18} color={p.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: c.text }}>
                    {p.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: c.iconMuted, marginTop: 2 }}>
                    {p.target} {p.unit}/day
                  </Text>
                </View>
                <Ionicons
                  name={added ? 'checkmark-circle' : 'add-circle-outline'}
                  size={22}
                  color={added ? p.color : c.iconMuted}
                />
              </Pressable>
            );
          })}
        </View>

        {/* Custom */}
        <View style={{ gap: 10 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '800',
              letterSpacing: 0.7,
              color: c.iconMuted,
              textTransform: 'uppercase',
            }}
          >
            Custom
          </Text>
          {!showCustom ? (
            <Pressable
              disabled={atCap}
              onPress={() => setShowCustom(true)}
              style={({ pressed }) => ({
                padding: Spacing.md,
                borderRadius: Radii.lg,
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: Borders.hairline[scheme],
                alignItems: 'center',
                opacity: atCap ? 0.5 : pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: c.text }}>
                + Add custom habit
              </Text>
            </Pressable>
          ) : (
            <View
              style={{
                padding: Spacing.md,
                borderRadius: Radii.lg,
                borderWidth: 1,
                borderColor: Borders.hairline[scheme],
                backgroundColor: c.surface,
                gap: 10,
              }}
            >
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Habit name (e.g. Read for 5 min)"
                placeholderTextColor={c.iconMuted}
                style={{
                  fontSize: 14,
                  color: c.text,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: Radii.md,
                  backgroundColor: c.background,
                }}
              />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  value={target}
                  onChangeText={setTarget}
                  placeholder="Target"
                  placeholderTextColor={c.iconMuted}
                  keyboardType="number-pad"
                  style={{
                    flex: 1,
                    fontSize: 14,
                    color: c.text,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: Radii.md,
                    backgroundColor: c.background,
                  }}
                />
                <TextInput
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="Unit (min, time)"
                  placeholderTextColor={c.iconMuted}
                  style={{
                    flex: 2,
                    fontSize: 14,
                    color: c.text,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: Radii.md,
                    backgroundColor: c.background,
                  }}
                />
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  onPress={() => setShowCustom(false)}
                  style={({ pressed }) => ({
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: Radii.md,
                    alignItems: 'center',
                    backgroundColor: c.background,
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: c.text }}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={submitCustom}
                  disabled={!title.trim()}
                  style={({ pressed }) => ({
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: Radii.md,
                    alignItems: 'center',
                    backgroundColor: '#7B68EE',
                    opacity: !title.trim() ? 0.5 : pressed ? 0.85 : 1,
                  })}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Add</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            paddingVertical: 12,
            alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: c.iconMuted }}>Done</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
