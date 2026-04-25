import { create } from 'zustand';

import type { Trigger } from '@/features/wellness-engine/triggers';

interface CheckInState {
  active: Trigger | null;
  /** Triggers we've already shown today, so we don't spam */
  shownKeys: Set<string>;
  /** Manually triggered demo (bypasses dedupe) */
  demoTrigger: (trigger: Trigger) => void;
  /** Auto-trigger from watcher; returns true if shown */
  maybeTrigger: (trigger: Trigger) => boolean;
  dismiss: () => void;
}

function dayKey(t: Trigger): string {
  const d = new Date(t.detectedAt);
  return `${d.toISOString().slice(0, 10)}:${t.kind}:${t.severity}`;
}

export const useCheckInStore = create<CheckInState>((set, get) => ({
  active: null,
  shownKeys: new Set(),
  demoTrigger: (trigger) => set({ active: trigger }),
  maybeTrigger: (trigger) => {
    const key = dayKey(trigger);
    if (get().shownKeys.has(key)) return false;
    if (get().active) return false;
    const nextShown = new Set(get().shownKeys);
    nextShown.add(key);
    set({ active: trigger, shownKeys: nextShown });
    return true;
  },
  dismiss: () => set({ active: null }),
}));
