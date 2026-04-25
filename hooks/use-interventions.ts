import { useState, useCallback } from 'react';
import { useWellnessEngine } from './use-wellness-engine';
import type { Intervention } from '@/features/wellness-engine/interventions';

export function useInterventions(): {
  current: Intervention | null;
  dismiss: () => void;
  markDone: () => void;
} {
  const { interventions } = useWellnessEngine();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const current = interventions.find((i) => !dismissedIds.has(i.id)) ?? null;

  const dismiss = useCallback(() => {
    if (current) setDismissedIds((prev) => new Set(prev).add(current.id));
  }, [current]);

  const markDone = useCallback(() => {
    if (current) setDismissedIds((prev) => new Set(prev).add(current.id));
    // TODO: persist feedback to user store
  }, [current]);

  return { current, dismiss, markDone };
}
