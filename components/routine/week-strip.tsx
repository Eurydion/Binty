import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Colors, Palette, Radii } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

interface Props {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  routineDates?: Set<string>;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function WeekStrip({ selectedDate, onSelectDate, routineDates }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const today = useMemo(() => new Date(), []);

  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [selectedDate]);

  // Compute streak: consecutive days with routines ending at today (or yesterday)
  const streakDates = useMemo(() => {
    if (!routineDates || routineDates.size === 0) return new Set<string>();
    const todayKey = formatDateKey(today);
    const dates = new Set<string>();
    const d = new Date(today);
    if (!routineDates.has(todayKey)) {
      d.setDate(d.getDate() - 1);
    }
    while (true) {
      const key = formatDateKey(d);
      if (routineDates.has(key)) {
        dates.add(key);
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return dates;
  }, [routineDates, today]);

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
      {weekDays.map((day, i) => {
        const isSelected = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, today);
        const dayKey = formatDateKey(day);
        const isStreak = streakDates.has(dayKey);

        return (
          <Pressable
            key={i}
            onPress={() => onSelectDate(day)}
            accessibilityLabel={`${DAY_LABELS[day.getDay()]} ${day.getDate()}`}
            style={({ pressed }) => ({
              alignItems: 'center',
              paddingVertical: 8,
              paddingHorizontal: 6,
              borderRadius: Radii.md,
              backgroundColor: isSelected
                ? Palette.kangkong
                : 'transparent',
              opacity: pressed ? 0.7 : 1,
              minWidth: 40,
            })}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: isSelected
                  ? Palette.cloud
                  : c.iconMuted,
                marginBottom: 6,
              }}>
              {DAY_LABELS[day.getDay()]}
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: isSelected
                  ? Palette.cloud
                  : c.text,
              }}>
              {day.getDate()}
            </Text>
            {isStreak && (
              <Ionicons name="flame" size={12} color={Palette.kamote} style={{ marginTop: 2 }} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
