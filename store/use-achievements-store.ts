import { create } from 'zustand';

import { ACHIEVEMENTS, ACHIEVEMENTS_BY_ID } from '@/features/achievements/catalog';
import type { AchievementState } from '@/features/achievements/types';
import { load, save, STORAGE_KEYS } from '@/services/storage';

interface PersistedShape {
  byId: Record<string, AchievementState>;
  scenariosTried: string[];
  sawPanicSpike: boolean;
  usedBreathIntervention: boolean;
  hasConnected: boolean;
}

interface Store extends PersistedShape {
  recentlyUnlocked: string[];
  hydrated: boolean;

  unlock: (id: string) => void;
  consumeRecent: (id: string) => void;
  trackScenario: (id: string) => void;
  markPanicSpike: () => void;
  markBreathIntervention: () => void;
  markConnected: () => void;
  unlockedCount: () => number;
  totalPoints: () => number;
  hydrate: () => Promise<void>;
}

const initialById = ACHIEVEMENTS.reduce<Record<string, AchievementState>>((acc, a) => {
  acc[a.id] = { id: a.id, unlockedAt: null };
  return acc;
}, {});

function persist(state: Store): void {
  const payload: PersistedShape = {
    byId: state.byId,
    scenariosTried: state.scenariosTried,
    sawPanicSpike: state.sawPanicSpike,
    usedBreathIntervention: state.usedBreathIntervention,
    hasConnected: state.hasConnected,
  };
  save(STORAGE_KEYS.ACHIEVEMENTS, payload);
}

export const useAchievementsStore = create<Store>((set, get) => ({
  byId: initialById,
  recentlyUnlocked: [],
  scenariosTried: [],
  sawPanicSpike: false,
  usedBreathIntervention: false,
  hasConnected: false,
  hydrated: false,

  unlock: (id) => {
    const cur = get().byId[id];
    if (!cur || cur.unlockedAt != null) return;
    set((state) => {
      const next = {
        ...state,
        byId: { ...state.byId, [id]: { id, unlockedAt: Date.now() } },
        recentlyUnlocked: [...state.recentlyUnlocked, id],
      };
      persist(next as Store);
      return next;
    });
  },
  consumeRecent: (id) =>
    set((state) => ({ recentlyUnlocked: state.recentlyUnlocked.filter((x) => x !== id) })),
  trackScenario: (id) =>
    set((state) => {
      if (state.scenariosTried.includes(id)) return state;
      const next = { ...state, scenariosTried: [...state.scenariosTried, id] };
      persist(next as Store);
      return next;
    }),
  markPanicSpike: () =>
    set((state) => {
      if (state.sawPanicSpike) return state;
      const next = { ...state, sawPanicSpike: true };
      persist(next as Store);
      return next;
    }),
  markBreathIntervention: () =>
    set((state) => {
      if (state.usedBreathIntervention) return state;
      const next = { ...state, usedBreathIntervention: true };
      persist(next as Store);
      return next;
    }),
  markConnected: () =>
    set((state) => {
      if (state.hasConnected) return state;
      const next = { ...state, hasConnected: true };
      persist(next as Store);
      return next;
    }),
  unlockedCount: () =>
    Object.values(get().byId).filter((s) => s.unlockedAt != null).length,
  totalPoints: () =>
    Object.values(get().byId).reduce((sum, s) => {
      if (s.unlockedAt == null) return sum;
      const def = ACHIEVEMENTS_BY_ID[s.id];
      return sum + (def?.points ?? 0);
    }, 0),

  hydrate: async () => {
    if (get().hydrated) return;
    const stored = await load<PersistedShape>(STORAGE_KEYS.ACHIEVEMENTS);
    if (stored) {
      // Merge stored byId with current catalog (handles newly added achievements).
      const mergedById: Record<string, AchievementState> = { ...initialById };
      for (const id of Object.keys(stored.byId ?? {})) {
        if (mergedById[id]) {
          mergedById[id] = stored.byId[id];
        }
      }
      set({
        byId: mergedById,
        scenariosTried: stored.scenariosTried ?? [],
        sawPanicSpike: stored.sawPanicSpike ?? false,
        usedBreathIntervention: stored.usedBreathIntervention ?? false,
        hasConnected: stored.hasConnected ?? false,
        hydrated: true,
      });
    } else {
      set({ hydrated: true });
    }
  },
}));
