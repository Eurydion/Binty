import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Borders, Colors, Palette, Radii } from '@/constants/theme';
import { useColorScheme } from '@/features/hooks/use-color-scheme';
import { SCENARIOS } from '@/features/simulation/scenarios';
import { useHealthStore } from '@/store/use-health-store';

export function ScenarioPicker() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const router = useRouter();
  const scenario = useHealthStore((s) => s.scenario);
  const preset = SCENARIOS[scenario];

  return (
    <View style={{ paddingHorizontal: 24 }}>
      <Pressable
        onPress={() => router.push('/modals/scenario-picker')}
        style={({ pressed }) => ({
          borderRadius: Radii.pill,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderWidth: 1,
          borderColor: Borders.hairline[scheme],
          backgroundColor: c.surface,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          alignSelf: 'flex-start',
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Ionicons name="flask-outline" size={14} color={Palette.kangkong} />
        <Text style={{ fontSize: 12, color: c.iconMuted, fontWeight: '600' }}>Scenario</Text>
        <Text style={{ fontSize: 13, color: c.text, fontWeight: '700' }}>{preset.label}</Text>
        <Ionicons name="chevron-down" size={14} color={c.iconMuted} />
      </Pressable>
    </View>
  );
}
