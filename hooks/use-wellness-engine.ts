import { adaptRoutine } from '@/features/wellness-engine/adapter';
import { analyze } from '@/features/wellness-engine/analyzer';
import type { Intervention } from '@/features/wellness-engine/interventions';
import { buildInterventions } from '@/features/wellness-engine/interventions';
import { useHealthStore } from '@/store/use-health-store';
import { useRoutineStore } from '@/store/use-routine-store';
import { useUserStore } from '@/store/use-user-store';
import { useEffect } from 'react';

export function useWellnessEngine(): { interventions: Intervention[] } {
  const snapshot = useHealthStore((s) => s.snapshot);
  const { mealLogs, routine, setRoutine } = useRoutineStore();
  const profile = useUserStore((s) => s.profile);

  // Adapt routine when health changes (only if a routine already exists)
  useEffect(() => {
    if (!routine) return;
    const analysis = analyze(snapshot, mealLogs);
    const adapted = adaptRoutine(routine, analysis);
    setRoutine(adapted);
  }, [snapshot]);

  const analysis = analyze(snapshot, mealLogs);
  const interventions = buildInterventions(analysis.flags);

  return { interventions };
}
