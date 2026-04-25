import { generateRoutine } from '@/features/wellness-engine/generator';
import { generateRoutineWithAI } from '@/features/wellness-engine/ai-generator';
import { formatDate } from '@/lib/date';
import { save, load, remove, getAllKeys, ROUTINE_PREFIX, STORAGE_KEYS } from '@/services/storage';
import type { HealthSnapshot } from '@/types/health';
import type { MealLog, Meal } from '@/types/meals';
import type { DailyRoutine, MealSlot, ActivitySlot, SlotAlternative } from '@/types/routine';
import type { UserProfile } from '@/types/user';
import type { RoutineCategory } from '@/components/routine/category-chips';
import { create } from 'zustand';

const MAX_CACHED_DAYS = 14;

function routineKeyForDate(date: string): string {
  return ROUTINE_PREFIX + date;
}

async function cleanupOldRoutines(keepDates: Set<string>): Promise<void> {
  try {
    const allKeys = await getAllKeys();
    const routineKeys = allKeys.filter((k) => k.startsWith(ROUTINE_PREFIX));
    const toRemove = routineKeys.filter((k) => {
      const date = k.slice(ROUTINE_PREFIX.length);
      return !keepDates.has(date);
    });
    for (const key of toRemove) {
      await remove(key);
    }
  } catch {
    // Silently ignore cleanup errors
  }
}

function getRecentDates(centerDate: Date, count: number): Set<string> {
  const dates = new Set<string>();
  const half = Math.floor(count / 2);
  for (let i = -half; i <= half; i++) {
    const d = new Date(centerDate);
    d.setDate(d.getDate() + i);
    dates.add(formatDate(d));
  }
  return dates;
}

interface RoutineState {
  routine: DailyRoutine | null;
  routineCache: Record<string, DailyRoutine>;
  mealLogs: MealLog[];
  waterLoggedMl: number;
  selectedDate: Date;
  selectedCategory: RoutineCategory;
  isGenerating: boolean;
  generationError: string | null;
  setRoutine: (routine: DailyRoutine) => void;
  logMeal: (log: MealLog) => void;
  logWater: (ml: number) => void;
  completeSlot: (slotId: string) => void;
  setSelectedDate: (date: Date) => void;
  setSelectedCategory: (category: RoutineCategory) => void;
  generateWithAI: (user: UserProfile, health: HealthSnapshot) => Promise<void>;
  ensureRoutineForDate: (user: UserProfile, health: HealthSnapshot, forceRegenerate?: boolean) => Promise<void>;
  swapSlot: (slotId: string, alternative: SlotAlternative) => void;
  swapMeal: (slotId: string, meal: Meal) => void;
  loadRoutineForDate: (date: string) => Promise<DailyRoutine | null>;
  loadFromStorage: () => Promise<void>;
  loadAllRoutineDates: () => Promise<void>;
}

export const useRoutineStore = create<RoutineState>((set, get) => ({
  routine: null,
  routineCache: {},
  mealLogs: [],
  waterLoggedMl: 0,
  selectedDate: new Date(),
  selectedCategory: 'All',
  isGenerating: false,
  generationError: null,

  setRoutine: (routine) => {
    const dateKey = routine.date;
    set((state) => ({
      routine,
      routineCache: { ...state.routineCache, [dateKey]: routine },
    }));
    save(routineKeyForDate(dateKey), routine);
  },

  logMeal: (log) =>
    set((state) => {
      const logs = [...state.mealLogs, log];
      save(STORAGE_KEYS.MEAL_LOGS, logs);
      return { mealLogs: logs };
    }),

  logWater: (ml) =>
    set((state) => {
      const total = state.waterLoggedMl + ml;
      save(STORAGE_KEYS.WATER_LOG, total);
      return { waterLoggedMl: total };
    }),

  completeSlot: (slotId) =>
    set((state) => {
      if (!state.routine) return state;
      const routine = {
        ...state.routine,
        blocks: state.routine.blocks.map((block) => ({
          ...block,
          slots: block.slots.map((slot) =>
            slot.id === slotId ? { ...slot, completed: !slot.completed } : slot,
          ),
        })),
      };
      const dateKey = routine.date;
      save(routineKeyForDate(dateKey), routine);
      return {
        routine,
        routineCache: { ...state.routineCache, [dateKey]: routine },
      };
    }),

  setSelectedDate: (date) => set({ selectedDate: date }),

  setSelectedCategory: (category) => set({ selectedCategory: category }),

  loadRoutineForDate: async (date: string): Promise<DailyRoutine | null> => {
    const cached = get().routineCache[date];
    if (cached) return cached;
    const stored = await load<DailyRoutine>(routineKeyForDate(date));
    if (stored) {
      set((state) => ({
        routineCache: { ...state.routineCache, [date]: stored },
      }));
    }
    return stored;
  },

  ensureRoutineForDate: async (user, health, forceRegenerate = false) => {
    const date = formatDate(get().selectedDate);

    if (!forceRegenerate) {
      // Check cache first
      const cached = get().routineCache[date];
      if (cached) {
        set({ routine: cached });
        return;
      }

      // Check storage
      const stored = await load<DailyRoutine>(routineKeyForDate(date));
      if (stored) {
        set((state) => ({
          routine: stored,
          routineCache: { ...state.routineCache, [date]: stored },
        }));
        return;
      }
    }

    // Generate new routine
    set({ isGenerating: true, generationError: null });
    try {
      const localRoutine = await generateRoutine(user, health, date);
      set((state) => ({
        routine: localRoutine,
        routineCache: { ...state.routineCache, [date]: localRoutine },
        isGenerating: false,
      }));
      save(routineKeyForDate(date), localRoutine);

      // AI enhancement in background
      const hasAI = !!process.env.EXPO_PUBLIC_AI_API_KEY;
      if (hasAI) {
        generateRoutineWithAI(user, health, date)
          .then((aiRoutine) => {
            const currentDate = formatDate(get().selectedDate);
            if (currentDate === date) {
              set((state) => ({
                routine: aiRoutine,
                routineCache: { ...state.routineCache, [date]: aiRoutine },
              }));
              save(routineKeyForDate(date), aiRoutine);
            }
          })
          .catch(() => {});
      }

      // Cleanup old cached routines
      const keepDates = getRecentDates(get().selectedDate, MAX_CACHED_DAYS);
      cleanupOldRoutines(keepDates);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Generation failed";
      set({ isGenerating: false, generationError: message });
    }
  },

  generateWithAI: async (user, health) => {
    await get().ensureRoutineForDate(user, health, true);
  },

  swapSlot: (slotId, alternative) =>
    set((state) => {
      if (!state.routine) return state;
      const routine = {
        ...state.routine,
        blocks: state.routine.blocks.map((block) => ({
          ...block,
          slots: block.slots.map((slot) => {
            if (slot.id !== slotId || slot.type === 'meal' || slot.type === 'hydration') return slot;
            const actSlot = slot as ActivitySlot;
            return {
              ...actSlot,
              title: alternative.title,
              durationMinutes: alternative.durationMinutes,
              intensity: alternative.intensity,
              description: alternative.description,
              category: alternative.category ?? actSlot.category,
            };
          }),
        })),
      };
      const dateKey = routine.date;
      save(routineKeyForDate(dateKey), routine);
      return {
        routine,
        routineCache: { ...state.routineCache, [dateKey]: routine },
      };
    }),

  swapMeal: (slotId, meal) =>
    set((state) => {
      if (!state.routine) return state;
      const routine = {
        ...state.routine,
        blocks: state.routine.blocks.map((block) => ({
          ...block,
          slots: block.slots.map((slot) => {
            if (slot.id !== slotId || slot.type !== 'meal') return slot;
            return {
              ...slot,
              suggestedMeal: meal,
              suggestedMealId: meal.id,
            } as MealSlot;
          }),
        })),
      };
      const dateKey = routine.date;
      save(routineKeyForDate(dateKey), routine);
      return {
        routine,
        routineCache: { ...state.routineCache, [dateKey]: routine },
      };
    }),

  loadFromStorage: async () => {
    const date = formatDate(get().selectedDate);
    const stored = await load<DailyRoutine>(routineKeyForDate(date));
    if (stored) {
      set((state) => ({
        routine: stored,
        routineCache: { ...state.routineCache, [date]: stored },
      }));
    }
  },

  loadAllRoutineDates: async () => {
    try {
      const allKeys = await getAllKeys();
      const routineKeys = allKeys.filter((k) => k.startsWith(ROUTINE_PREFIX));
      const entries: Record<string, DailyRoutine> = {};
      for (const key of routineKeys) {
        const date = key.slice(ROUTINE_PREFIX.length);
        // Skip if already cached
        if (get().routineCache[date]) {
          entries[date] = get().routineCache[date];
          continue;
        }
        const stored = await load<DailyRoutine>(key);
        if (stored) {
          entries[date] = stored;
        }
      }
      if (Object.keys(entries).length > 0) {
        set((state) => ({
          routineCache: { ...state.routineCache, ...entries },
        }));
      }
    } catch {
      // Silently ignore load errors
    }
  },
}));
