import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/screen-header';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RoutineScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 16,
          paddingBottom: 32,
        }}
      >
        <ScreenHeader title="Routine" />

        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
            paddingVertical: 64,
          }}
        >
          <Text
            style={{
              color: c.iconMuted,
              fontSize: 14,
              textAlign: 'center',
            }}
          >
            No routine loaded yet.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
