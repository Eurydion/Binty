import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Borders, Colors, Palette, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface Action {
  id: string;
  route: string;
  label: string;
  sub: string;
  icon: IoniconName;
  tint: string;
}

const ACTIONS: Action[] = [
  {
    id: 'check-in',
    route: '/modals/self-check-in',
    label: 'How are you?',
    sub: 'Quick check-in',
    icon: 'happy-outline',
    tint: Palette.teal,
  },
  {
    id: 'toolkit',
    route: '/wellness',
    label: 'Self-care',
    sub: 'Routines toolkit',
    icon: 'sparkles-outline',
    tint: Palette.kangkong,
  },
  {
    id: 'ppg',
    route: '/ppg-scan',
    label: 'Pulse scan',
    sub: 'Use your camera',
    icon: 'heart-circle-outline',
    tint: Palette.kamote,
  },
];

/**
 * Home actions strip — surfaces the features that work without a smartwatch:
 * manual check-in, self-care toolkit, and camera-based PPG heart-rate scan.
 */
export function HomeActions() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  return (
    <View style={{ paddingHorizontal: 24 }}>
      <Text
        style={{
          color: c.iconMuted,
          fontSize: 11,
          fontWeight: '800',
          letterSpacing: 0.7,
          marginBottom: 8,
        }}
      >
        QUICK ACTIONS
      </Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {ACTIONS.map((a) => (
          <Pressable
            key={a.id}
            onPress={() => router.push(a.route as any)}
            style={({ pressed }) => ({
              flex: 1,
              padding: Spacing.md,
              borderRadius: Radii.lg,
              backgroundColor: c.surface,
              borderWidth: 1,
              borderColor: Borders.hairline[scheme],
              opacity: pressed ? 0.85 : 1,
              minHeight: 96,
            })}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: Radii.pill,
                backgroundColor: a.tint + '24',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name={a.icon} size={18} color={a.tint} />
            </View>
            <Text style={{ color: c.text, fontSize: 13, fontWeight: '800', marginTop: 8 }}>
              {a.label}
            </Text>
            <Text style={{ color: c.iconMuted, fontSize: 11, marginTop: 2 }}>{a.sub}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
