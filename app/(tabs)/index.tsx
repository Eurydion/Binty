import { ScrollView, Text, View } from 'react-native';

import { HeartBpmCard } from '@/components/cards/heart-bpm-card';
import { TodaysPlanCard } from '@/components/cards/todays-plan-card';
import { WaterIntakeCard } from '@/components/cards/water-intake-card';
import { BintyInsight } from '@/components/home/binty-insight';
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
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
    >
      <View style={{ paddingHorizontal:50, paddingBottom: 16 }}>
        <Text
          style={{
            color: c.text,
            fontSize: 28,
            fontWeight: '700',
            letterSpacing: -0.3,
          }}
        >
          Hi, {profile.name}
        </Text>
      </View>

      <BintyInsight state={snapshot.detectedState} />

      <View style={{ height: 12 }} />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'stretch',
          gap: 12,
          paddingHorizontal: 24,
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
  );
}
