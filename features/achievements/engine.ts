import type { SleepNight } from '@/features/sleep/types';

export interface EvalSnapshot {
  hasConnected: boolean;
  scenariosTried: string[];
  totalScenarios: number;
  waterPctOfGoal: number;
  waterLogsToday: number;
  lowStressStreakSec: number; // consecutive seconds at stress<25
  steadyBpmStreakSec: number; // consecutive seconds in 60..80
  sessionSteps: number;
  recoveryScore: number;
  sawPanicSpike: boolean;
  usedBreathIntervention: boolean;
  lastNight: SleepNight | null;
  alreadyUnlocked: Set<string>;
}

/**
 * Pure: given a snapshot of relevant state, return ids that should now be
 * unlocked. Caller decides what to do with them (toast + persist).
 */
export function evaluate(s: EvalSnapshot): string[] {
  const unlocks: string[] = [];
  const try_ = (id: string, cond: boolean) => {
    if (cond && !s.alreadyUnlocked.has(id)) unlocks.push(id);
  };

  try_('first-connect', s.hasConnected);
  try_('hydrated', s.waterPctOfGoal >= 1);
  try_('calm-mind', s.lowStressStreakSec >= 60);
  try_('heartbeat-explorer', s.scenariosTried.length >= s.totalScenarios && s.totalScenarios > 0);
  try_('deep-diver', !!s.lastNight && s.lastNight.summary.quality === 'good');
  try_('recovery-master', s.recoveryScore >= 85);
  try_('step-counter', s.sessionSteps >= 1000);
  try_('storm-rider', s.sawPanicSpike);
  try_('restful-night', !!s.lastNight && s.lastNight.summary.deep >= 90);
  try_('steady-pulse', s.steadyBpmStreakSec >= 60);
  try_('daily-sip', s.waterLogsToday >= 3);
  try_('mindful-pause', s.usedBreathIntervention);

  return unlocks;
}
