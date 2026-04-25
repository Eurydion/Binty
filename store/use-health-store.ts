import { create } from 'zustand';

import {
  connect as simConnect,
  disconnect as simDisconnect,
  getState as simGetState,
  pause as simPause,
  resume as simResume,
  setScenario as simSetScenario,
  subscribe as simSubscribe,
  type ConnectionState,
  type HistorySample,
  type SimulatorState,
} from '@/features/smartwatch/simulator';
import type { Scenario } from '@/features/simulation/scenarios';
import type { HealthSnapshot } from '@/types/health';

interface HealthState {
  snapshot: HealthSnapshot;
  connection: ConnectionState;
  scenario: Scenario;
  history: HistorySample[];
  setSnapshot: (snapshot: HealthSnapshot) => void;
  connect: () => void;
  pause: () => void;
  resume: () => void;
  disconnect: () => void;
  setScenario: (scenario: Scenario) => void;
}

const initial = simGetState();

export const useHealthStore = create<HealthState>((set) => ({
  snapshot: initial.snapshot,
  connection: initial.connection,
  scenario: initial.scenario,
  history: initial.history,
  setSnapshot: (snapshot) => set({ snapshot }),
  connect: () => simConnect(),
  pause: () => simPause(),
  resume: () => simResume(),
  disconnect: () => simDisconnect(),
  setScenario: (scenario) => simSetScenario(scenario),
}));

// Bridge simulator → store (single subscription, lives for app lifetime)
simSubscribe((state: SimulatorState) => {
  useHealthStore.setState({
    snapshot: state.snapshot,
    connection: state.connection,
    scenario: state.scenario,
    history: state.history,
  });
});
