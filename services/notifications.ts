// Notification service — wraps expo-notifications
// Install: npx expo install expo-notifications

export async function requestPermissions(): Promise<boolean> {
  // Placeholder — import and implement with expo-notifications when installed
  console.warn('expo-notifications not yet installed. Run: npx expo install expo-notifications');
  return false;
}

export async function scheduleLocalNotification(options: {
  title: string;
  body: string;
  triggerSeconds: number;
}): Promise<void> {
  console.log('[Notification scheduled]', options);
  // TODO: implement with expo-notifications
}

export async function cancelAllNotifications(): Promise<void> {
  console.log('[All notifications cancelled]');
  // TODO: implement with expo-notifications
}
