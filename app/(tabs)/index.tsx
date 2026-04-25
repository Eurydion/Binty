import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeartPulseCard } from '@/components/cards/heart-pulse-card';
import { TodaysPlanCard } from '@/components/cards/todays-plan-card';
import { WaterIntakeCard } from '@/components/cards/water-intake-card';
import { BintyInsight } from '@/components/home/binty-insight';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSmartwatch } from '@/hooks/use-smartwatch';
import { useAchievementsStore } from '@/store/use-achievements-store';
import { useRoutineStore } from '@/store/use-routine-store';
import { useUserStore } from '@/store/use-user-store';

export default function HomeScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const router = useRouter();
  const { snapshot } = useSmartwatch();
  const profile = useUserStore((s) => s.profile);
  const { waterLoggedMl } = useRoutineStore();
  const recentlyUnlocked = useAchievementsStore((s) => s.recentlyUnlocked);
  const hasUnseen = recentlyUnlocked.length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
      >
        <ScreenHeader
          title={`Hi, ${profile.name}`}
          right={
            <Pressable
              onPress={() => router.push('/achievements')}
              hitSlop={10}
              style={({ pressed }) => ({
                width: 40,
                height: 40,
                borderRadius: 9999,
                backgroundColor: c.surface,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Ionicons name="trophy" size={20} color={Palette.kangkong} />
              {hasUnseen ? (
                <View
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 8,
                    height: 8,
                    borderRadius: 9999,
                    backgroundColor: Palette.kamote,
                  }}
                />
              ) : null}
            </Pressable>
          }
        />

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
          <HeartPulseCard bpm={snapshot.latest.heartRate} />
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
