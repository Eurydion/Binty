import { adaptRoutine } from '@/features/wellness-engine/adapter';
import { analyze } from '@/features/wellness-engine/analyzer';
import { generateRoutine } from '@/features/wellness-engine/generator';
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

  // Generate routine on mount if none exists
  useEffect(() => {
    if (!routine) {
      const generated = generateRoutine(profile, snapshot);
      setRoutine(generated);
    }
  }, []);

  // Adapt routine when health changes
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
