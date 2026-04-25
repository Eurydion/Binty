import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { UnlockOverlay } from '@/components/achievements/unlock-overlay';
import { useAchievementWatcher } from '@/hooks/use-achievement-watcher';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAchievementsStore } from '@/store/use-achievements-store';
import { useHabitsStore } from '@/store/use-habits-store';
import { useTipsStore } from '@/store/use-tips-store';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const hydrate = useAchievementsStore((s) => s.hydrate);
  const hydrateTips = useTipsStore((s) => s.hydrate);
  const hydrateHabits = useHabitsStore((s) => s.hydrate);
  useAchievementWatcher();

  useEffect(() => {
    hydrate();
    hydrateTips();
    hydrateHabits();
  }, [hydrate, hydrateTips, hydrateHabits]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="heart-rate" options={{ title: 'Heart Rate' }} />
        <Stack.Screen name="sleep-detail" options={{ title: 'Sleep' }} />
        <Stack.Screen name="achievements" options={{ title: 'Achievements' }} />
        <Stack.Screen name="habits" options={{ title: 'Habits' }} />
        <Stack.Screen name="modals/intervention" options={{ presentation: 'modal', title: 'Alert' }} />
        <Stack.Screen name="modals/log-meal" options={{ presentation: 'modal', title: 'Log Meal' }} />
        <Stack.Screen name="modals/log-water" options={{ presentation: 'modal', title: 'Log Water' }} />
        <Stack.Screen name="modals/insights" options={{ presentation: 'modal', title: 'Insights' }} />
        <Stack.Screen name="modals/tip-detail" options={{ presentation: 'modal', title: 'Daily Tip' }} />
        <Stack.Screen name="modals/scenario-picker" options={{ presentation: 'modal', title: 'Trigger Simulation' }} />
      </Stack>
      <UnlockOverlay />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
