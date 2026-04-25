export type HealthSource = 'simulated' | 'smartwatch';

export interface HealthReading {
  timestamp: number;
  heartRate: number;       // bpm
  hrv: number;             // ms — stress indicator
  steps: number;
  spo2: number;            // %
  stressLevel: number;     // 0–100 derived score
}

export interface SleepData {
  date: string;            // YYYY-MM-DD
  durationMinutes: number;
  quality: 'poor' | 'fair' | 'good';
  deepSleepMinutes: number;
  remSleepMinutes: number;
}

export type EmotionalState = 'calm' | 'anxious' | 'stressed' | 'sad' | 'energized';

export interface HealthSnapshot {
  latest: HealthReading;
  sleep: SleepData | null;
  detectedState: EmotionalState;
  source: HealthSource;
}
