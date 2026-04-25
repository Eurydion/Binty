import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Borders, Colors, Palette, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface Routine {
  id: string;
  route: string;
  title: string;
  duration: string;
  description: string;
  bestFor: string;
  icon: IoniconName;
  tint: string;
}

const ROUTINES: Routine[] = [
  {
    id: 'breathing',
    route: '/modals/breathing',
    title: '4-7-8 Breathing',
    duration: '60 sec',
    description: 'Slow exhale activates your calm nervous system.',
    bestFor: 'Anxiety · Racing thoughts',
    icon: 'leaf-outline',
    tint: Palette.teal,
  },
  {
    id: 'box-breathing',
    route: '/modals/box-breathing',
    title: 'Box Breathing',
    duration: '90 sec',
    description: 'Equal in–hold–out–hold. Used by athletes and pilots.',
    bestFor: 'Focus · Pre-meeting jitters',
    icon: 'square-outline',
    tint: Palette.kangkong,
  },
  {
    id: 'grounding',
    route: '/modals/grounding',
    title: '5-4-3-2-1 Grounding',
    duration: '2 min',
    description: 'Anchor yourself with your five senses.',
    bestFor: 'Panic · Dissociation · Overwhelm',
    icon: 'compass-outline',
    tint: Palette.silverBlue,
  },
  {
    id: 'body-scan',
    route: '/modals/body-scan',
    title: 'Body Scan',
    duration: '3 min',
    description: 'Release tension head to toe with guided awareness.',
    bestFor: 'Stress · Tension · Bedtime',
    icon: 'body-outline',
    tint: Palette.kamote,
  },
  {
    id: 'gratitude',
    route: '/modals/gratitude',
    title: 'Three Good Things',
    duration: '1 min',
    description: 'Quick gratitude reflection — proven mood lifter.',
    bestFor: 'Low mood · Evening reflection',
    icon: 'heart-outline',
    tint: '#C97B6E',
  },
];

export default function WellnessToolkitScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: Spacing.xl, paddingBottom: 40 }}
      >
        <Text style={{ color: c.iconMuted, fontSize: 11, fontWeight: '800', letterSpacing: 0.7 }}>
          SELF-CARE TOOLKIT
        </Text>
        <Text style={{ color: c.text, fontSize: 28, fontWeight: '800', marginTop: 4 }}>
          Routines for any moment
        </Text>
        <Text style={{ color: c.iconMuted, fontSize: 14, marginTop: 8, lineHeight: 20 }}>
          Use these any time — no smartwatch needed. Pick what fits how you feel.
        </Text>

        <View style={{ gap: 12, marginTop: Spacing.xl }}>
          {ROUTINES.map((r) => (
            <Pressable
              key={r.id}
              onPress={() => router.push(r.route as any)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                padding: Spacing.lg,
                borderRadius: Radii.lg,
                backgroundColor: c.surface,
                borderWidth: 1,
                borderColor: Borders.hairline[scheme],
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: Radii.pill,
                  backgroundColor: r.tint + '24',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={r.icon} size={22} color={r.tint} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ color: c.text, fontSize: 15, fontWeight: '800' }}>{r.title}</Text>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: Radii.pill,
                      backgroundColor: c.background,
                    }}
                  >
                    <Text style={{ color: c.iconMuted, fontSize: 10, fontWeight: '700' }}>
                      {r.duration}
                    </Text>
                  </View>
                </View>
                <Text style={{ color: c.text, opacity: 0.7, fontSize: 13, marginTop: 4 }}>
                  {r.description}
                </Text>
                <Text style={{ color: r.tint, fontSize: 11, fontWeight: '700', marginTop: 6 }}>
                  {r.bestFor}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={c.iconMuted} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
