import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Borders, Colors, Palette, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Topic {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  color: string;
}

const TOPICS: Topic[] = [
  {
    icon: 'heart',
    title: 'How we read your heart',
    body: 'Heart rate is the number of times your heart beats per minute. We watch trends over time, not single moments — your normal range will look different from someone else’s.',
    color: Palette.kangkong,
  },
  {
    icon: 'flash',
    title: 'What stress means here',
    body: 'Your stress score combines heart rate variability and rhythm patterns. High doesn’t mean broken — it means your body is responding. Movement, breathing, and rest all bring it down.',
    color: '#D97757',
  },
  {
    icon: 'leaf',
    title: 'Your recovery score',
    body: 'Recovery blends sleep quality with current stress. Aim for steady, not perfect — gentle days are part of being well.',
    color: Palette.teal,
  },
  {
    icon: 'moon',
    title: 'Why sleep matters',
    body: 'Deep and REM sleep do most of the repair work. Even a small bedtime shift can change how you feel tomorrow.',
    color: Palette.silverBlue,
  },
];

export default function InsightsModal() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 12 }}>
        <Text style={{ fontSize: 14, color: c.iconMuted, marginBottom: 4 }}>
          Quick explanations of the numbers you see in Analytics. We’ll add deeper guides over time.
        </Text>
        {TOPICS.map((t) => (
          <View
            key={t.title}
            style={{
              borderRadius: Radii.lg,
              padding: Spacing.lg,
              borderWidth: 1,
              borderColor: Borders.hairline[scheme],
              backgroundColor: c.surface,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9999,
                  backgroundColor: t.color + '22',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={t.icon} size={16} color={t.color} />
              </View>
              <Text style={{ fontSize: 15, fontWeight: '700', color: c.text }}>{t.title}</Text>
            </View>
            <Text style={{ fontSize: 13, lineHeight: 19, color: c.iconMuted }}>{t.body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
