import { Pressable, ScrollView, Text, View } from 'react-native';

import { Colors, Palette, Radii } from '@/constants/theme';
import { useColorScheme } from '@/features/hooks/use-color-scheme';

export type RoutineCategory = 'All' | 'Fitness' | 'Consumption' | 'Work' | 'Mindfulness';

const CATEGORIES: RoutineCategory[] = ['All', 'Fitness', 'Consumption', 'Work', 'Mindfulness'];

interface Props {
  selected: RoutineCategory;
  onSelect: (category: RoutineCategory) => void;
}

export function CategoryChips({ selected, onSelect }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={{ gap: 8 }}>
        {CATEGORIES.map((cat) => {
          const isActive = selected === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => onSelect(cat)}
              style={({ pressed }) => ({
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: Radii.pill,
                backgroundColor: isActive
                  ? Palette.kangkong
                  : 'transparent',
                borderWidth: 1,
                borderColor: isActive
                  ? 'transparent'
                  : scheme === 'light' ? 'rgba(44,44,44,0.15)' : 'rgba(249,249,249,0.15)',
                opacity: pressed ? 0.7 : 1,
              })}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: isActive
                    ? Palette.cloud
                    : c.text,
                }}>
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
