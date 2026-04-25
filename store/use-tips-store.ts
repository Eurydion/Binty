import { create } from 'zustand';

import { load, save, STORAGE_KEYS } from '@/services/storage';

interface PersistedShape {
  savedIds: string[];
}

interface Store {
  savedIds: string[];
  hydrated: boolean;

  isSaved: (id: string) => boolean;
  toggleSave: (id: string) => void;
  hydrate: () => Promise<void>;
}

function persist(savedIds: string[]): void {
  const payload: PersistedShape = { savedIds };
  save(STORAGE_KEYS.SAVED_TIPS, payload);
}

export const useTipsStore = create<Store>((set, get) => ({
  savedIds: [],
  hydrated: false,

  isSaved: (id) => get().savedIds.includes(id),

  toggleSave: (id) =>
    set((state) => {
      const next = state.savedIds.includes(id)
        ? state.savedIds.filter((x) => x !== id)
        : [...state.savedIds, id];
      persist(next);
      return { savedIds: next };
    }),

  hydrate: async () => {
    if (get().hydrated) return;
    const stored = await load<PersistedShape>(STORAGE_KEYS.SAVED_TIPS);
    set({
      savedIds: stored?.savedIds ?? [],
      hydrated: true,
    });
  },
}));
