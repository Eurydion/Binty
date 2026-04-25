import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeartBpmCard } from '@/components/cards/heart-bpm-card';
import { TodaysPlanCard } from '@/components/cards/todays-plan-card';
import { WaterIntakeCard } from '@/components/cards/water-intake-card';
import { BintyInsight } from '@/components/home/binty-insight';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSmartwatch } from '@/hooks/use-smartwatch';
import { useRoutineStore } from '@/store/use-routine-store';
import { useUserStore } from '@/store/use-user-store';

export default function HomeScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const snapshot = useSmartwatch();
  const profile = useUserStore((s) => s.profile);
  const { waterLoggedMl } = useRoutineStore();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
      >
        <ScreenHeader title={`Hi, ${profile.name}`} />

        <BintyInsight state={snapshot.detectedState} />

        <View style={{ height: 12 }} />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'stretch',
            gap: 12,
            paddingHorizontal: 24,
            height: 160, // ← add this
          }}
        >
          <HeartBpmCard bpm={snapshot.latest.heartRate} />
          <WaterIntakeCard
            loggedMl={waterLoggedMl}
            goalMl={profile.dailyWaterGoalMl}
          />
        </View>

        <View style={{ height: 12 }} />

        <TodaysPlanCard />
      </ScrollView>
    </SafeAreaView>
  );
}
