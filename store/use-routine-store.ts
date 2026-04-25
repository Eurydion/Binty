import { create } from 'zustand';
import type { DailyRoutine, MealSlot } from '@/types/routine';
import type { MealLog } from '@/types/meals';

interface RoutineState {
  routine: DailyRoutine | null;
  mealLogs: MealLog[];
  waterLoggedMl: number;
  setRoutine: (routine: DailyRoutine) => void;
  logMeal: (log: MealLog) => void;
  logWater: (ml: number) => void;
  completeSlot: (slotId: string) => void;
}

export const useRoutineStore = create<RoutineState>((set) => ({
  routine: null,
  mealLogs: [],
  waterLoggedMl: 0,

  setRoutine: (routine) => set({ routine }),

  logMeal: (log) => set((state) => ({ mealLogs: [...state.mealLogs, log] })),

  logWater: (ml) => set((state) => ({ waterLoggedMl: state.waterLoggedMl + ml })),

  completeSlot: (slotId) =>
    set((state) => {
      if (!state.routine) return state;
      return {
        routine: {
          ...state.routine,
          blocks: state.routine.blocks.map((block) => ({
            ...block,
            slots: block.slots.map((slot) =>
              slot.id === slotId ? { ...slot, completed: true } : slot,
            ),
          })),
        },
      };
    }),
}));
