import type { Ionicons } from '@expo/vector-icons';

export type HabitCategory =
  | 'hydration'
  | 'movement'
  | 'mindfulness'
  | 'nutrition'
  | 'sleep'
  | 'custom';

export interface Habit {
  id: string;
  title: string;
  /** Short unit label, e.g. "glass", "min", "round". */
  unit: string;
  /** Daily target count (e.g. 8 glasses). */
  target: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  category: HabitCategory;
  createdAt: number;
}

/** date is YYYY-MM-DD; value is count for that day. */
export type HabitDayLog = Record<string, number>;
/** habitId -> day -> count. */
export type HabitLogs = Record<string, HabitDayLog>;
