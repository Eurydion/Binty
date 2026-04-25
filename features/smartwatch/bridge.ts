import type { HealthSnapshot } from '@/types/health';

/**
 * Bridge for real smartwatch / health API integration.
 * Swap this module's implementation when moving from simulated to real data.
 * The rest of the app reads from health-store.ts and never calls this directly.
 */
export async function fetchLatestSnapshot(): Promise<HealthSnapshot> {
  // TODO: implement BLE / Health Connect / HealthKit integration
  throw new Error('Real smartwatch bridge not yet implemented. Use simulator.');
}
