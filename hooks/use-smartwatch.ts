import { useEffect } from 'react';
import { useHealthStore } from '@/store/use-health-store';
import { startSimulator, stopSimulator } from '@/features/smartwatch/simulator';
import type { HealthSnapshot } from '@/types/health';

/**
 * Starts the health data source (simulated by default).
 * When real smartwatch support is added, swap the source here only.
 */
export function useSmartwatch(): HealthSnapshot {
  const { snapshot, setSnapshot } = useHealthStore();

  useEffect(() => {
    startSimulator(setSnapshot, 30000);
    return () => stopSimulator();
  }, []);

  return snapshot;
}
