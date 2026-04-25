import { create } from 'zustand';
import type { HealthSnapshot } from '@/types/health';
import { getSnapshot } from '@/features/smartwatch/simulator';

interface HealthState {
  snapshot: HealthSnapshot;
  refresh: () => void;
  setSnapshot: (snapshot: HealthSnapshot) => void;
}

export const useHealthStore = create<HealthState>((set) => ({
  snapshot: getSnapshot(),
  refresh: () => set({ snapshot: getSnapshot() }),
  setSnapshot: (snapshot) => set({ snapshot }),
}));
