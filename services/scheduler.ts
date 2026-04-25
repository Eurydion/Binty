// Background scheduler for periodic health checks and reminders
// Install: npx expo install expo-task-manager expo-background-fetch

export const TASKS = {
  HEALTH_CHECK: 'binty:health-check',
  HYDRATION_REMINDER: 'binty:hydration-reminder',
} as const;

export function registerTasks(): void {
  // TODO: implement with expo-task-manager + expo-background-fetch
  console.warn('Background tasks not yet configured. Install expo-task-manager.');
}
