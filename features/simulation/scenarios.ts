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
      if (tickIndex < 2) return { hr: 145 };
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
      const pattern = [0, 18, -12, 6, -8, 14][tickIndex % 6];
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
      if (tickIndex < 4) return { hr: 140 - tickIndex * 6 };
      if (tickIndex < 12) return { hr: 110 - (tickIndex - 4) * 3 };
      return {};
    },
  },
};

export const SCENARIO_LIST: ScenarioPreset[] = Object.values(SCENARIOS);
