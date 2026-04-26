import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Borders, Colors, Palette, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import healthFactsData from '@/assets/dataset/healthfacts.json';

interface Fact {
  id: string;
  text: string;
}

interface CategorySection {
  key: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  facts: Fact[];
}

const CATEGORY_META: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  water: { icon: 'water', color: Palette.silverBlue },
  steps: { icon: 'walk', color: Palette.kangkong },
  heart_rate: { icon: 'heart', color: '#D97757' },
  sleep: { icon: 'moon', color: Palette.silverBlue },
  stress: { icon: 'flash', color: '#D97757' },
  nutrition: { icon: 'restaurant', color: Palette.kangkong },
  mental_wellbeing: { icon: 'happy', color: Palette.teal },
  recovery: { icon: 'leaf', color: Palette.teal },
  sunlight: { icon: 'sunny', color: '#E0A458' },
};

interface HealthFactsShape {
  category_label?: string;
  categories: Record<string, { title: string; facts: Fact[] }>;
}

const data = healthFactsData as HealthFactsShape;

const SECTIONS: CategorySection[] = Object.entries(data.categories).map(([key, cat]) => {
  const meta = CATEGORY_META[key] ?? { icon: 'information-circle', color: Palette.kangkong };
  return {
    key,
    title: cat.title,
    icon: meta.icon,
    color: meta.color,
    facts: cat.facts,
  };
});

export default function InsightsModal() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 20 }}>
        <Text style={{ fontSize: 14, color: c.iconMuted, marginBottom: 4 }}>
          Quick explanations and bite-sized facts about the numbers you see in Analytics.
        </Text>
        {SECTIONS.map((section) => (
          <View key={section.key} style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9999,
                  backgroundColor: section.color + '22',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={section.icon} size={16} color={section.color} />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>
                {section.title}
              </Text>
            </View>
            {section.facts.map((fact) => (
              <View
                key={fact.id}
                style={{
                  borderRadius: Radii.lg,
                  padding: Spacing.lg,
                  borderWidth: 1,
                  borderColor: Borders.hairline[scheme],
                  backgroundColor: c.surface,
                }}
              >
                <Text style={{ fontSize: 13, lineHeight: 19, color: c.iconMuted }}>
                  {fact.text}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
