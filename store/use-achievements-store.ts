import { create } from 'zustand';

import { ACHIEVEMENTS } from '@/features/achievements/catalog';
import type { AchievementState } from '@/features/achievements/types';

interface Store {
  byId: Record<string, AchievementState>;
  recentlyUnlocked: string[];
  /** Set of every scenario id we've ever seen — drives the explorer goal. */
  scenariosTried: string[];
  /** Did the user enter the panic-spike scenario at least once? */
  sawPanicSpike: boolean;
  /** Did the user open a breath intervention modal at least once? */
  usedBreathIntervention: boolean;
  /** True after the first successful connect (not just session-current). */
  hasConnected: boolean;

  unlock: (id: string) => void;
  consumeRecent: (id: string) => void;
  trackScenario: (id: string) => void;
  markPanicSpike: () => void;
  markBreathIntervention: () => void;
  markConnected: () => void;
  unlockedCount: () => number;
}

const initialById = ACHIEVEMENTS.reduce<Record<string, AchievementState>>((acc, a) => {
  acc[a.id] = { id: a.id, unlockedAt: null };
  return acc;
}, {});

export const useAchievementsStore = create<Store>((set, get) => ({
  byId: initialById,
  recentlyUnlocked: [],
  scenariosTried: [],
  sawPanicSpike: false,
  usedBreathIntervention: false,
  hasConnected: false,

  unlock: (id) => {
    const cur = get().byId[id];
    if (!cur || cur.unlockedAt != null) return;
    set((state) => ({
      byId: { ...state.byId, [id]: { id, unlockedAt: Date.now() } },
      recentlyUnlocked: [...state.recentlyUnlocked, id],
    }));
  },
  consumeRecent: (id) =>
    set((state) => ({ recentlyUnlocked: state.recentlyUnlocked.filter((x) => x !== id) })),
  trackScenario: (id) =>
    set((state) =>
      state.scenariosTried.includes(id)
        ? state
        : { scenariosTried: [...state.scenariosTried, id] },
    ),
  markPanicSpike: () => set({ sawPanicSpike: true }),
  markBreathIntervention: () => set({ usedBreathIntervention: true }),
  markConnected: () => set({ hasConnected: true }),
  unlockedCount: () =>
    Object.values(get().byId).filter((s) => s.unlockedAt != null).length,
}));
