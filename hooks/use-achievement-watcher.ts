import { useEffect, useMemo, useRef } from 'react';

import { evaluate } from '@/features/achievements/engine';
import { generateMockNight } from '@/features/sleep/generator';
import { SCENARIOS } from '@/features/simulation/scenarios';
import { useAchievementsStore } from '@/store/use-achievements-store';
import { useHabitsStore } from '@/store/use-habits-store';
import { useHealthStore } from '@/store/use-health-store';
import { useRoutineStore } from '@/store/use-routine-store';
import { useUserStore } from '@/store/use-user-store';

const TOTAL_SCENARIOS = Object.keys(SCENARIOS).length;

/**
 * Mounted once at root. Subscribes to relevant stores, builds a snapshot
 * for the achievements engine each second, and triggers `unlock` for any
 * newly-earned ids. Pure side-effect hook; returns nothing.
 */
export function useAchievementWatcher() {
  const connection = useHealthStore((s) => s.connection);
  const scenario = useHealthStore((s) => s.scenario);
  const history = useHealthStore((s) => s.history);
  const snapshot = useHealthStore((s) => s.snapshot);

  const waterLoggedMl = useRoutineStore((s) => s.waterLoggedMl);
  const profile = useUserStore((s) => s.profile);

  const trackScenario = useAchievementsStore((s) => s.trackScenario);
  const markPanicSpike = useAchievementsStore((s) => s.markPanicSpike);
  const markConnected = useAchievementsStore((s) => s.markConnected);
  const unlock = useAchievementsStore((s) => s.unlock);

  // Track scenario history and connection events.
  useEffect(() => {
    if (connection !== 'disconnected') {
      markConnected();
      trackScenario(scenario);
      if (scenario === 'panic-spike') markPanicSpike();
    }
  }, [connection, scenario, markConnected, trackScenario, markPanicSpike]);

  // Streak tracking — counts consecutive samples meeting condition. Each tick
  // is ~1s so length≈seconds. Avoids subscribing to history element-by-element.
  const lowStressStreakSec = useMemo(() => {
    let streak = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].stress < 25) streak += 1;
      else break;
    }
    return streak;
  }, [history]);

  const steadyBpmStreakSec = useMemo(() => {
    let streak = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      const b = history[i].bpm;
      if (b >= 60 && b <= 80) streak += 1;
      else break;
    }
    return streak;
  }, [history]);

  const lastNight = useMemo(
    () => (connection !== 'disconnected' ? generateMockNight() : null),
    [connection],
  );

  // Snapshot reads from the latest store state to avoid stale closures.
  const evalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    const tick = () => {
      const ach = useAchievementsStore.getState();
      const habitsState = useHabitsStore.getState();
      const habitStreakDays = habitsState.habits.reduce(
        (max, h) => Math.max(max, habitsState.currentStreak(h.id)),
        habitsState.overallStreak(),
      );
      const stressNow = snapshot.latest.stressLevel;
      const recoveryScore = Math.round(
        0.6 * (100 - stressNow) +
          0.4 * (lastNight?.summary.qualityScore ?? 0),
      );
      const goalMl = profile.dailyWaterGoalMl || 2000;
      const ids = evaluate({
        hasConnected: ach.hasConnected,
        scenariosTried: ach.scenariosTried,
        totalScenarios: TOTAL_SCENARIOS,
        waterPctOfGoal: waterLoggedMl / goalMl,
        waterLogsToday: Math.floor(waterLoggedMl / 250), // approximate: ~250ml per log
        lowStressStreakSec,
        steadyBpmStreakSec,
        sessionSteps: snapshot.latest.steps,
        recoveryScore,
        sawPanicSpike: ach.sawPanicSpike,
        usedBreathIntervention: ach.usedBreathIntervention,
        lastNight,
        habitStreakDays,
        alreadyUnlocked: new Set(
          Object.values(ach.byId)
            .filter((a) => a.unlockedAt != null)
            .map((a) => a.id),
        ),
      });
      ids.forEach(unlock);
    };
    tick();
    evalRef.current = setInterval(tick, 2000);
    return () => {
      if (evalRef.current) clearInterval(evalRef.current);
    };
  }, [
    snapshot,
    waterLoggedMl,
    profile.dailyWaterGoalMl,
    lowStressStreakSec,
    steadyBpmStreakSec,
    lastNight,
    unlock,
  ]);
}
