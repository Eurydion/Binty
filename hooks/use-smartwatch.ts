import type { Scenario } from '@/features/simulation/scenarios';
import type { ConnectionState, HistorySample } from '@/features/smartwatch/simulator';
import { useHealthStore } from '@/store/use-health-store';
import type { HealthSnapshot } from '@/types/health';

export interface SmartwatchView {
  snapshot: HealthSnapshot;
  connection: ConnectionState;
  scenario: Scenario;
  history: HistorySample[];
}

/**
 * Live snapshot + connection + scenario + rolling history from the
 * scenario-driven smartwatch simulator. All state is read from the
 * zustand store; the simulator pushes ticks into the store directly.
 */
export function useSmartwatch(): SmartwatchView {
  const snapshot = useHealthStore((s) => s.snapshot);
  const connection = useHealthStore((s) => s.connection);
  const scenario = useHealthStore((s) => s.scenario);
  const history = useHealthStore((s) => s.history);
  return { snapshot, connection, scenario, history };
}
