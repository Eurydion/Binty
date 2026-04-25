import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import type { HealthSnapshot } from '@/types/health';
import { useHealthStore } from '@/store/use-health-store';

interface PedometerStatus {
  available: boolean;
  steps: number;
}

/**
 * Phone-based step counter that supplements (or replaces) the smartwatch.
 * Uses expo-sensors Pedometer when available. Gracefully degrades to
 * showing 0 + `available: false` when permissions/hardware aren't there.
 *
 * When the smartwatch is disconnected, we feed the phone steps into
 * the health snapshot so the rest of the app keeps working.
 */
export function usePhonePedometer(): PedometerStatus {
  const [available, setAvailable] = useState(false);
  const [steps, setSteps] = useState(0);
  const subRef = useRef<{ remove(): void } | null>(null);
  const startStepsRef = useRef<number | null>(null);
  const connection = useHealthStore((s) => s.connection);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (Platform.OS === 'web') {
        setAvailable(false);
        return;
      }
      try {
        const { Pedometer } = await import('expo-sensors');
        const isAvailable = await Pedometer.isAvailableAsync();
        if (!isAvailable || cancelled) {
          setAvailable(false);
          return;
        }

        // Request permission (Android 10+ activity recognition)
        const perm = await Pedometer.requestPermissionsAsync().catch(() => ({ granted: false }));
        if (!perm.granted || cancelled) {
          setAvailable(false);
          return;
        }

        setAvailable(true);

        // Try to seed with today's count from system, otherwise 0
        try {
          const start = new Date();
          start.setHours(0, 0, 0, 0);
          const result = await Pedometer.getStepCountAsync(start, new Date());
          if (!cancelled && result?.steps != null) {
            setSteps(result.steps);
            startStepsRef.current = result.steps;
          }
        } catch {
          // iOS-only API; fine to ignore on Android
        }

        // Watch live deltas
        subRef.current = Pedometer.watchStepCount((data) => {
          if (cancelled) return;
          setSteps((prev) => (startStepsRef.current != null ? startStepsRef.current + data.steps : data.steps));
        });
      } catch {
        setAvailable(false);
      }
    }

    init();
    return () => {
      cancelled = true;
      subRef.current?.remove();
    };
  }, []);

  // When the smartwatch is disconnected, surface phone steps in the snapshot.
  useEffect(() => {
    if (!available || connection === 'connected') return;
    const snap = useHealthStore.getState().snapshot;
    const next: HealthSnapshot = {
      ...snap,
      latest: { ...snap.latest, steps },
      source: 'simulated',
    };
    useHealthStore.setState({ snapshot: next });
  }, [steps, available, connection]);

  return { available, steps };
}
