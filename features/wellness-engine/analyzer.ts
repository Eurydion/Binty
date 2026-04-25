import type { EmotionalState, HealthSnapshot } from '@/types/health';
import type { MealLog } from '@/types/meals';

export interface AnalysisResult {
  stressScore: number;       // 0–100
  detectedState: EmotionalState;
  flags: AnalysisFlag[];
}

export interface AnalysisFlag {
  type: 'high-hr' | 'low-hrv' | 'poor-sleep' | 'skipped-meal' | 'low-water' | 'high-stress';
  severity: 'low' | 'medium' | 'high';
  context: string;
}

/**
 * Cross-signal analysis: combines health data + meal logs to derive
 * an overall stress score and flag anomalies for intervention.
 */
export function analyze(health: HealthSnapshot, mealLogs: MealLog[]): AnalysisResult {
  const flags: AnalysisFlag[] = [];

  if (health.latest.heartRate > 100) {
    flags.push({ type: 'high-hr', severity: 'medium', context: `HR at ${health.latest.heartRate} bpm while at rest` });
  }

  if (health.latest.hrv < 20) {
    flags.push({ type: 'low-hrv', severity: 'high', context: 'HRV indicates elevated stress' });
  }

  if (health.sleep && health.sleep.durationMinutes < 300) {
    flags.push({ type: 'poor-sleep', severity: 'medium', context: `Only ${Math.round(health.sleep.durationMinutes / 60)}hrs sleep` });
  }

  const stressScore = Math.min(100, health.latest.stressLevel + (flags.length * 5));

  return {
    stressScore,
    detectedState: health.detectedState,
    flags,
  };
}
