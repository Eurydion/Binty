import { create } from 'zustand';

import type { HabitPreset } from '@/features/habits/presets';
import type { Habit, HabitLogs } from '@/features/habits/types';
import { formatDate } from '@/lib/date';
import { load, save, STORAGE_KEYS } from '@/services/storage';

export const MAX_ACTIVE_HABITS = 5;

interface PersistedShape {
  habits: Habit[];
  logs: HabitLogs;
}

interface Store extends PersistedShape {
  hydrated: boolean;

  addFromPreset: (preset: HabitPreset) => void;
  addCustom: (input: Omit<Habit, 'id' | 'createdAt'>) => void;
  removeHabit: (id: string) => void;
  increment: (id: string, delta?: number) => void;
  setCount: (id: string, date: string, count: number) => void;

  countToday: (id: string) => number;
  isCompletedOn: (id: string, date: string) => boolean;
  currentStreak: (id: string) => number;
  bestStreak: (id: string) => number;
  /** Consecutive days where ANY tracked habit was logged at all. */
  overallStreak: () => number;

  hydrate: () => Promise<void>;
}

function persist(habits: Habit[], logs: HabitLogs): void {
  const payload: PersistedShape = { habits, logs };
  save(STORAGE_KEYS.HABITS, payload);
}

function todayKey(): string {
  return formatDate(new Date());
}

function dateKey(d: Date): string {
  return formatDate(d);
}

function backDays(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push(dateKey(d));
  }
  return out;
}

export const useHabitsStore = create<Store>((set, get) => ({
  habits: [],
  logs: {},
  hydrated: false,

  addFromPreset: (preset) => {
    const { habits } = get();
    if (habits.some((h) => h.id === preset.id)) return;
    if (habits.length >= MAX_ACTIVE_HABITS) return;
    const habit: Habit = { ...preset, createdAt: Date.now() };
    const next = [...habits, habit];
    persist(next, get().logs);
    set({ habits: next });
  },

  addCustom: (input) => {
    const { habits } = get();
    if (habits.length >= MAX_ACTIVE_HABITS) return;
    const id = `custom-${Date.now().toString(36)}`;
    const habit: Habit = { ...input, id, createdAt: Date.now() };
    const next = [...habits, habit];
    persist(next, get().logs);
    set({ habits: next });
  },

  removeHabit: (id) => {
    const habits = get().habits.filter((h) => h.id !== id);
    const logs = { ...get().logs };
    delete logs[id];
    persist(habits, logs);
    set({ habits, logs });
  },

  increment: (id, delta = 1) => {
    const day = todayKey();
    const cur = get().logs[id]?.[day] ?? 0;
    get().setCount(id, day, Math.max(0, cur + delta));
  },

  setCount: (id, date, count) => {
    const logs = { ...get().logs };
    const habitLog = { ...(logs[id] ?? {}) };
    if (count <= 0) {
      delete habitLog[date];
    } else {
      habitLog[date] = count;
    }
    logs[id] = habitLog;
    persist(get().habits, logs);
    set({ logs });
  },

  countToday: (id) => get().logs[id]?.[todayKey()] ?? 0,

  isCompletedOn: (id, date) => {
    const habit = get().habits.find((h) => h.id === id);
    if (!habit) return false;
    const c = get().logs[id]?.[date] ?? 0;
    return c >= habit.target;
  },

  currentStreak: (id) => {
    const habit = get().habits.find((h) => h.id === id);
    if (!habit) return 0;
    const log = get().logs[id] ?? {};
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 366; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const k = dateKey(d);
      const c = log[k] ?? 0;
      if (c >= habit.target) {
        streak += 1;
      } else if (i === 0) {
        // today not yet completed — don't break streak from yesterday
        continue;
      } else {
        break;
      }
    }
    return streak;
  },

  bestStreak: (id) => {
    const habit = get().habits.find((h) => h.id === id);
    if (!habit) return 0;
    const log = get().logs[id] ?? {};
    const days = Object.keys(log).sort();
    if (days.length === 0) return 0;
    let best = 0;
    let cur = 0;
    let prev: Date | null = null;
    for (const k of days) {
      if ((log[k] ?? 0) < habit.target) {
        cur = 0;
        prev = null;
        continue;
      }
      const d = new Date(k);
      if (prev) {
        const diff = Math.round((d.getTime() - prev.getTime()) / 86_400_000);
        cur = diff === 1 ? cur + 1 : 1;
      } else {
        cur = 1;
      }
      best = Math.max(best, cur);
      prev = d;
    }
    return best;
  },

  overallStreak: () => {
    const { habits, logs } = get();
    if (habits.length === 0) return 0;
    let streak = 0;
    const days = backDays(366);
    for (let i = 0; i < days.length; i++) {
      const k = days[i];
      const anyLogged = habits.some((h) => (logs[h.id]?.[k] ?? 0) > 0);
      if (anyLogged) {
        streak += 1;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }
    return streak;
  },

  hydrate: async () => {
    if (get().hydrated) return;
    const stored = await load<PersistedShape>(STORAGE_KEYS.HABITS);
    set({
      habits: stored?.habits ?? [],
      logs: stored?.logs ?? {},
      hydrated: true,
    });
  },
}));
