import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Borders, Colors, Palette, Radii } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

interface Props {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
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

export function WeekStrip({ selectedDate, onSelectDate }: Props) {
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

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
      {weekDays.map((day, i) => {
        const isSelected = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, today);

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
                ? scheme === 'light' ? Palette.charcoal : Palette.cloud
                : 'transparent',
              opacity: pressed ? 0.7 : 1,
              minWidth: 40,
            })}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: isSelected
                  ? (scheme === 'light' ? Palette.cloud : Palette.charcoal)
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
                  ? (scheme === 'light' ? Palette.cloud : Palette.charcoal)
                  : c.text,
              }}>
              {day.getDate()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
