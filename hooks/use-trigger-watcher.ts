import { useEffect, useRef } from 'react';

import { detectTrigger, isUrgent } from '@/features/wellness-engine/triggers';
import { useCheckInStore } from '@/store/use-check-in-store';
import { useHealthStore } from '@/store/use-health-store';
import { useRoutineStore } from '@/store/use-routine-store';
import { useUserStore } from '@/store/use-user-store';

/**
 * Watches health snapshot and surfaces urgent triggers as a check-in modal.
 * Only urgent (anxiety / severe stress) triggers auto-fire; mild ones
 * stay quiet and just inform the BintyInsight message.
 */
export function useTriggerWatcher() {
  const snapshot = useHealthStore((s) => s.snapshot);
  const waterLoggedMl = useRoutineStore((s) => s.waterLoggedMl);
  const goalMl = useUserStore((s) => s.profile.dailyWaterGoalMl);
  const maybeTrigger = useCheckInStore((s) => s.maybeTrigger);
  const lastFiredRef = useRef<number>(0);

  useEffect(() => {
    // Throttle: at most one auto-trigger every 30 seconds
    const now = Date.now();
    if (now - lastFiredRef.current < 30_000) return;

    const trigger = detectTrigger({
      snapshot,
      hour: new Date().getHours(),
      waterRatio: goalMl > 0 ? waterLoggedMl / goalMl : 0,
    });

    if (isUrgent(trigger) && trigger) {
      const fired = maybeTrigger(trigger);
      if (fired) lastFiredRef.current = now;
    }
  }, [snapshot, waterLoggedMl, goalMl, maybeTrigger]);
}
