import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="heart-rate" options={{ title: 'Heart Rate' }} />
        <Stack.Screen name="modals/intervention" options={{ presentation: 'modal', title: 'Alert' }} />
        <Stack.Screen name="modals/log-meal" options={{ presentation: 'modal', title: 'Log Meal' }} />
        <Stack.Screen name="modals/log-water" options={{ presentation: 'modal', title: 'Log Water' }} />
        <Stack.Screen name="modals/insights" options={{ presentation: 'modal', title: 'Insights' }} />
        <Stack.Screen name="modals/scenario-picker" options={{ presentation: 'modal', title: 'Trigger Simulation' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
