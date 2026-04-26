import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { UnlockOverlay } from '@/components/achievements/unlock-overlay';
import { useAchievementWatcher } from '@/hooks/use-achievement-watcher';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePhonePedometer } from '@/hooks/use-phone-pedometer';
import { useTriggerWatcher } from '@/hooks/use-trigger-watcher';
import { useAchievementsStore } from '@/store/use-achievements-store';
import { useCheckInStore } from '@/store/use-check-in-store';
import { useHabitsStore } from '@/store/use-habits-store';
import { useTipsStore } from '@/store/use-tips-store';
import { useUserStore } from '@/store/use-user-store';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  const hydrate = useAchievementsStore((s) => s.hydrate);
  const hydrateTips = useTipsStore((s) => s.hydrate);
  const hydrateHabits = useHabitsStore((s) => s.hydrate);
  const hydrateUser = useUserStore((s) => s.hydrate);

  const userHydrated = useUserStore((s) => s.hydrated);
  const onboardingComplete = useUserStore((s) => s.onboardingComplete);
  const activeCheckIn = useCheckInStore((s) => s.active);

  useAchievementWatcher();
  useTriggerWatcher();
  usePhonePedometer();

  useEffect(() => {
    // DEV ONLY: clear cached routines so recipe changes take effect — remove after confirming
    if (__DEV__) {
      import('@/services/storage').then(({ removeByPrefix, ROUTINE_PREFIX }) =>
        removeByPrefix(ROUTINE_PREFIX),
      );
    }

    hydrate();
    hydrateTips();
    hydrateHabits();
    hydrateUser();
  }, [hydrate, hydrateTips, hydrateHabits, hydrateUser]);

  // Onboarding gate
  useEffect(() => {
    if (!userHydrated) return;
    const inOnboarding = segments[0] === 'onboarding';
    if (!onboardingComplete && !inOnboarding) {
      router.replace('/onboarding');
    } else if (onboardingComplete && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [userHydrated, onboardingComplete, segments, router]);

  // Auto-open check-in when an urgent trigger fires
  useEffect(() => {
    if (!activeCheckIn) return;
    if (segments.some((s) => s === 'check-in' || s === 'breathing' || s === 'grounding')) return;
    router.push('/modals/check-in');
  }, [activeCheckIn, segments, router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="heart-rate" options={{ title: 'Heart Rate' }} />
        <Stack.Screen name="sleep-detail" options={{ title: 'Sleep' }} />
        <Stack.Screen name="achievements" options={{ title: 'Achievements' }} />
        <Stack.Screen name="habits" options={{ title: 'Habits' }} />
        <Stack.Screen name="modals/intervention" options={{ presentation: 'modal', title: 'Alert' }} />
        <Stack.Screen name="modals/log-meal" options={{ presentation: 'modal', title: 'Log Meal' }} />
        <Stack.Screen name="modals/log-water" options={{ presentation: 'modal', title: 'Log your water intake' }} />
        <Stack.Screen name="modals/insights" options={{ presentation: 'modal', title: 'Insights' }} />
        <Stack.Screen name="modals/tip-detail" options={{ presentation: 'modal', title: 'Daily Tip' }} />
        <Stack.Screen name="modals/scenario-picker" options={{ presentation: 'modal', title: 'Trigger Simulation' }} />
        <Stack.Screen name="modals/check-in" options={{ presentation: 'modal', headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="modals/breathing" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="modals/grounding" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="modals/box-breathing" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="modals/body-scan" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="modals/gratitude" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="modals/self-check-in" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="wellness" options={{ title: 'Self-care toolkit' }} />
        <Stack.Screen name="ppg-scan" options={{ title: 'Pulse scan' }} />
      </Stack>
      <UnlockOverlay />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
