import { Tabs } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CustomTabBar } from '@/components/ui/custom-tab-bar';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="routine" options={{ title: 'Routine' }} />
        <Tabs.Screen name="analytics" options={{ title: 'Analytics' }} />
      </Tabs>
    </SafeAreaProvider>
  );
}