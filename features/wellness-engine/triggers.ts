import type { EmotionalState, HealthSnapshot } from '@/types/health';

export type Severity = 'mild' | 'moderate' | 'severe';

export type TriggerKind =
  | 'anxiety-spike'
  | 'stress-spike'
  | 'low-energy'
  | 'dehydration-risk'
  | 'sedentary'
  | 'good-streak';

export interface Trigger {
  kind: TriggerKind;
  severity: Severity;
  state: EmotionalState;
  reason: string;
  /** ISO time the trigger was detected */
  detectedAt: number;
}

interface TriggerContext {
  snapshot: HealthSnapshot;
  hour: number; // 0-23
  waterRatio: number; // 0..1 of daily goal logged
}

/**
 * Detect the most actionable trigger given current health + context.
 * Returns null when the user is fine.
 *
 * Hierarchy: anxiety > stress > low-energy > dehydration > sedentary > good-streak.
 */
export function detectTrigger(ctx: TriggerContext): Trigger | null {
  const { snapshot, hour, waterRatio } = ctx;
  const r = snapshot.latest;
  const now = Date.now();

  // Anxiety: high HR + low HRV (sympathetic dominance)
  if (r.heartRate >= 110 && r.hrv <= 25) {
    return {
      kind: 'anxiety-spike',
      severity: r.heartRate >= 125 || r.hrv <= 18 ? 'severe' : 'moderate',
      state: 'anxious',
      reason: `Elevated heart rate (${r.heartRate} bpm) with low HRV (${r.hrv} ms).`,
      detectedAt: now,
    };
  }

  // Stress: high stress score + reduced HRV
  if (r.stressLevel >= 70) {
    return {
      kind: 'stress-spike',
      severity: r.stressLevel >= 85 ? 'severe' : 'moderate',
      state: 'stressed',
      reason: `Stress index at ${r.stressLevel}/100.`,
      detectedAt: now,
    };
  }

  // Low energy: low HR + low steps in afternoon
  if (hour >= 14 && hour <= 18 && r.heartRate < 65 && r.steps < 1500) {
    return {
      kind: 'low-energy',
      severity: 'mild',
      state: 'sad',
      reason: 'Low movement and resting heart rate this afternoon.',
      detectedAt: now,
    };
  }

  // Dehydration: late in day with little water
  if (hour >= 14 && waterRatio < 0.4) {
    return {
      kind: 'dehydration-risk',
      severity: waterRatio < 0.2 ? 'moderate' : 'mild',
      state: 'calm',
      reason: `Only ${Math.round(waterRatio * 100)}% of your water goal so far.`,
      detectedAt: now,
    };
  }

  // Sedentary: very few steps by mid-day
  if (hour >= 11 && r.steps < 800) {
    return {
      kind: 'sedentary',
      severity: 'mild',
      state: 'calm',
      reason: 'Very little movement today.',
      detectedAt: now,
    };
  }

  // Good streak (positive trigger)
  if (r.heartRate >= 60 && r.heartRate <= 80 && r.hrv >= 50 && r.stressLevel < 30) {
    return {
      kind: 'good-streak',
      severity: 'mild',
      state: 'calm',
      reason: 'Steady heart rate and high HRV — your body is regulated.',
      detectedAt: now,
    };
  }

  return null;
}

export function isUrgent(trigger: Trigger | null): boolean {
  if (!trigger) return false;
  return (
    (trigger.kind === 'anxiety-spike' || trigger.kind === 'stress-spike') &&
    (trigger.severity === 'moderate' || trigger.severity === 'severe')
  );
}
