export type Scenario =
  | 'resting'
  | 'light-activity'
  | 'high-anxiety'
  | 'panic-spike'
  | 'deep-sleep'
  | 'irregular'
  | 'post-workout';

export interface ScenarioPreset {
  id: Scenario;
  label: string;
  description: string;
  hr: { target: number; jitter: number };
  hrv: { target: number; jitter: number };
  stress: { target: number; jitter: number };
  spo2: { target: number; jitter: number };
  stepsPerTick: number;
  drift?: (state: { hr: number; tickIndex: number }) => Partial<{ hr: number }>;
}

export const SCENARIOS: Record<Scenario, ScenarioPreset> = {
  resting: {
    id: 'resting',
    label: 'Resting',
    description: 'Calm baseline — sitting comfortably.',
    hr: { target: 68, jitter: 2 },
    hrv: { target: 55, jitter: 4 },
    stress: { target: 20, jitter: 5 },
    spo2: { target: 98, jitter: 1 },
    stepsPerTick: 0,
  },
  'light-activity': {
    id: 'light-activity',
    label: 'Light Activity',
    description: 'Walking, light chores.',
    hr: { target: 95, jitter: 4 },
    hrv: { target: 40, jitter: 4 },
    stress: { target: 35, jitter: 6 },
    spo2: { target: 97, jitter: 1 },
    stepsPerTick: 12,
  },
  'high-anxiety': {
    id: 'high-anxiety',
    label: 'High Anxiety',
    description: 'Elevated nervous system response.',
    hr: { target: 110, jitter: 5 },
    hrv: { target: 22, jitter: 3 },
    stress: { target: 75, jitter: 7 },
    spo2: { target: 96, jitter: 1 },
    stepsPerTick: 0,
  },
  'panic-spike': {
    id: 'panic-spike',
    label: 'Panic Spike',
    description: 'Acute spike with quick decay.',
    hr: { target: 130, jitter: 6 },
    hrv: { target: 15, jitter: 3 },
    stress: { target: 90, jitter: 5 },
    spo2: { target: 95, jitter: 1 },
    stepsPerTick: 0,
    drift: ({ tickIndex }) => {
      // sharp spike for first ~10s, then steady at target
      if (tickIndex < 10) return { hr: 145 };
      return {};
    },
  },
  'deep-sleep': {
    id: 'deep-sleep',
    label: 'Deep Sleep',
    description: 'Restorative sleep cycle.',
    hr: { target: 52, jitter: 2 },
    hrv: { target: 70, jitter: 5 },
    stress: { target: 10, jitter: 3 },
    spo2: { target: 97, jitter: 1 },
    stepsPerTick: 0,
  },
  irregular: {
    id: 'irregular',
    label: 'Irregular',
    description: 'Inconsistent rhythm — possible arrhythmia.',
    hr: { target: 80, jitter: 4 },
    hrv: { target: 28, jitter: 6 },
    stress: { target: 55, jitter: 8 },
    spo2: { target: 96, jitter: 1 },
    stepsPerTick: 0,
    drift: ({ hr, tickIndex }) => {
      // change beat-pattern every ~5s for arrhythmia feel
      const idx = Math.floor(tickIndex / 5) % 6;
      const pattern = [0, 18, -12, 6, -8, 14][idx];
      return { hr: hr + pattern };
    },
  },
  'post-workout': {
    id: 'post-workout',
    label: 'Post-Workout',
    description: 'Recovering after exertion — HR decays toward rest.',
    hr: { target: 70, jitter: 3 },
    hrv: { target: 45, jitter: 4 },
    stress: { target: 30, jitter: 5 },
    spo2: { target: 98, jitter: 1 },
    stepsPerTick: 0,
    drift: ({ tickIndex }) => {
      // ~20s of high HR, then ~40s decay (≈3 min total recovery curve)
      if (tickIndex < 20) return { hr: 140 - tickIndex * 1.2 };
      if (tickIndex < 60) return { hr: 110 - (tickIndex - 20) * 0.6 };
      return {};
    },
  },
};

export const SCENARIO_LIST: ScenarioPreset[] = Object.values(SCENARIOS);
