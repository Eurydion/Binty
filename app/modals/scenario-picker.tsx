import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Borders, Colors, Palette, Radii, Spacing } from '@/constants/theme';
import { SCENARIO_LIST, type Scenario } from '@/features/simulation/scenarios';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHealthStore } from '@/store/use-health-store';

const MOOD_COLOR: Record<Scenario, string> = {
  resting: Palette.kangkong,
  'light-activity': Palette.teal,
  'high-anxiety': '#D97757',
  'panic-spike': '#D97757',
  'deep-sleep': Palette.silverBlue,
  irregular: Palette.kamote,
  'post-workout': Palette.kamote,
};

export default function ScenarioPickerModal() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const router = useRouter();
  const current = useHealthStore((s) => s.scenario);
  const setScenario = useHealthStore((s) => s.setScenario);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 10 }}>
        <Text style={{ fontSize: 13, color: c.iconMuted, marginBottom: 8 }}>
          Choose a simulation preset. Your smartwatch readings will smoothly transition toward the new state.
        </Text>
        {SCENARIO_LIST.map((s) => {
          const selected = s.id === current;
          return (
            <Pressable
              key={s.id}
              onPress={() => {
                setScenario(s.id);
                router.back();
              }}
              style={({ pressed }) => ({
                borderRadius: Radii.lg,
                padding: Spacing.lg,
                borderWidth: 1,
                borderColor: selected ? Palette.kangkong : Borders.hairline[scheme],
                backgroundColor: c.surface,
                opacity: pressed ? 0.85 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              })}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 9999,
                  backgroundColor: MOOD_COLOR[s.id],
                }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: c.text }}>{s.label}</Text>
                <Text style={{ fontSize: 12, color: c.iconMuted, marginTop: 2 }}>
                  {s.description}
                </Text>
                <Text style={{ fontSize: 11, color: c.iconMuted, marginTop: 4 }}>
                  Target: ~{s.hr.target} BPM · stress ~{s.stress.target}
                </Text>
              </View>
              {selected ? (
                <Ionicons name="checkmark-circle" size={22} color={Palette.kangkong} />
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
