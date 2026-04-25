import { useHealthStore } from '@/store/use-health-store';
import type { HealthSnapshot } from '@/types/health';

/**
 * Returns the latest health snapshot. Heart rate is held steady (no auto-randomization);
 * use `useHealthStore.adjustBpm` / `setBpm` to drive it manually for testing.
 */
export function useSmartwatch(): HealthSnapshot {
  return useHealthStore((s) => s.snapshot);
}
