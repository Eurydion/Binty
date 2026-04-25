import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Borders, Colors, Palette, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const DAY_LABELS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface Props {
  year: number;
  month: number; // 0-indexed
  selectedDate: Date;
  routineDates?: Set<string>; // dates with existing routines (YYYY-MM-DD)
  onSelectDate: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function MonthCalendar({
  year,
  month,
  selectedDate,
  routineDates,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const today = useMemo(() => new Date(), []);

  const calendarRows = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const rows: (number | null)[][] = [];
    let week: (number | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      week.push(d);
      if (week.length === 7) {
        rows.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      rows.push(week);
    }
    return rows;
  }, [year, month]);

  const handleDayPress = useCallback(
    (day: number) => {
      onSelectDate(new Date(year, month, day));
    },
    [year, month, onSelectDate],
  );

  return (
    <View>
      {/* Month header with navigation */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: Spacing.lg,
          gap: Spacing.lg,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: '700', color: c.text }}>
          {MONTH_NAMES[month]} {year}
        </Text>

        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          <Pressable
            onPress={onPrevMonth}
            accessibilityLabel="Previous month"
            hitSlop={12}
            style={({ pressed }) => ({
              width: 32,
              height: 32,
              borderRadius: Radii.pill,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.5 : 1,
            })}
          >
            <Ionicons name="chevron-back" size={20} color={c.text} />
          </Pressable>
          <Pressable
            onPress={onNextMonth}
            accessibilityLabel="Next month"
            hitSlop={12}
            style={({ pressed }) => ({
              width: 32,
              height: 32,
              borderRadius: Radii.pill,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.5 : 1,
            })}
          >
            <Ionicons name="chevron-forward" size={20} color={c.text} />
          </Pressable>
        </View>
      </View>

      {/* Day-of-week headers */}
      <View style={{ flexDirection: 'row', marginBottom: Spacing.sm }}>
        {DAY_LABELS.map((label) => (
          <View key={label} style={{ flex: 1, alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: c.iconMuted,
              }}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      {calendarRows.map((week, wi) => (
        <View key={wi} style={{ flexDirection: 'row', marginBottom: Spacing.xs }}>
          {week.map((day, di) => {
            if (day === null) {
              return <View key={`e-${di}`} style={{ flex: 1 }} />;
            }

            const dateObj = new Date(year, month, day);
            const isSelected = isSameDay(dateObj, selectedDate);
            const isToday = isSameDay(dateObj, today);
            const dateKey = formatDateKey(year, month, day);
            const hasRoutine = routineDates?.has(dateKey) ?? false;

            return (
              <View key={day} style={{ flex: 1, alignItems: 'center', paddingVertical: 2 }}>
                <Pressable
                  onPress={() => handleDayPress(day)}
                  accessibilityLabel={`${DAY_LABELS[dateObj.getDay()]} ${MONTH_NAMES[month]} ${day}`}
                  style={({ pressed }) => ({
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: Spacing.xs,
                    paddingHorizontal: Spacing.xs,
                    borderRadius: Radii.md,
                    backgroundColor: isSelected
                      ? Palette.kangkong
                      : pressed
                        ? scheme === 'light' ? 'rgba(44,44,44,0.04)' : 'rgba(249,249,249,0.04)'
                        : 'transparent',
                    opacity: pressed ? 0.85 : 1,
                    minWidth: 44,
                    minHeight: 44,
                  })}
                >
                  {/* Mascot placeholder icon */}
                  <Text style={{ fontSize: 20, opacity: hasRoutine ? 1 : 0.35, marginBottom: 1 }}>
                    🐱
                  </Text>

                  {/* Day number */}
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: isSelected || isToday ? '700' : '500',
                      color: isSelected
                        ? Palette.cloud
                        : isToday
                          ? Palette.kangkong
                          : c.text,
                    }}
                  >
                    {day}
                  </Text>

                  {/* "+" indicator for days without routine */}
                  {!hasRoutine && (
                    <View
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        backgroundColor: isSelected
                          ? 'rgba(255,255,255,0.3)'
                          : scheme === 'light'
                            ? 'rgba(44,44,44,0.08)'
                            : 'rgba(249,249,249,0.1)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 1,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '700',
                          color: isSelected
                            ? 'rgba(255,255,255,0.7)'
                            : c.iconMuted,
                          lineHeight: 13,
                        }}
                      >
                        +
                      </Text>
                    </View>
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}
