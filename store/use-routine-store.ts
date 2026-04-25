import { generateRoutine } from '@/features/wellness-engine/generator';
import { save, load, STORAGE_KEYS } from '@/services/storage';
import type { HealthSnapshot } from '@/types/health';
import type { MealLog, Meal } from '@/types/meals';
import type { DailyRoutine, MealSlot, ActivitySlot, SlotAlternative } from '@/types/routine';
import type { UserProfile } from '@/types/user';
import type { RoutineCategory } from '@/components/routine/category-chips';
import { create } from 'zustand';

interface RoutineState {
  routine: DailyRoutine | null;
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
  swapSlot: (slotId: string, alternative: SlotAlternative) => void;
  swapMeal: (slotId: string, meal: Meal) => void;
  loadFromStorage: () => Promise<void>;
}

export const useRoutineStore = create<RoutineState>((set, get) => ({
  routine: null,
  mealLogs: [],
  waterLoggedMl: 0,
  selectedDate: new Date(),
  selectedCategory: 'All',
  isGenerating: false,
  generationError: null,

  setRoutine: (routine) => {
    set({ routine });
    save(STORAGE_KEYS.ROUTINE, routine);
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
      save(STORAGE_KEYS.ROUTINE, routine);
      return { routine };
    }),

  setSelectedDate: (date) => set({ selectedDate: date }),

  setSelectedCategory: (category) => set({ selectedCategory: category }),

  generateWithAI: async (user, health) => {
    set({ isGenerating: true, generationError: null });
    try {
      const date = get().selectedDate.toISOString().split('T')[0];
      const routine = await generateRoutine(user, health, date);
      set({ routine, isGenerating: false });
      save(STORAGE_KEYS.ROUTINE, routine);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      set({ isGenerating: false, generationError: message });
    }
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
      save(STORAGE_KEYS.ROUTINE, routine);
      return { routine };
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
      save(STORAGE_KEYS.ROUTINE, routine);
      return { routine };
    }),

  loadFromStorage: async () => {
    const routine = await load<DailyRoutine>(STORAGE_KEYS.ROUTINE);
    if (routine) {
      const today = get().selectedDate.toISOString().split('T')[0];
      // Only restore if the stored routine is for today
      if (routine.date === today) {
        set({ routine });
      }
    }
  },
}));
