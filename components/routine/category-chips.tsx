import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Borders, Colors, Palette, Radii } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type RoutineCategory = 'All' | 'Fitness' | 'Consumption' | 'Work' | 'Mindfulness';

const CATEGORIES: RoutineCategory[] = ['All', 'Fitness', 'Consumption', 'Work', 'Mindfulness'];

interface Props {
  selected: RoutineCategory;
  onSelect: (category: RoutineCategory) => void;
  onFilterPress?: () => void;
}

export function CategoryChips({ selected, onSelect, onFilterPress }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
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
                  ? (scheme === 'light' ? Palette.charcoal : Palette.cloud)
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
                    ? (scheme === 'light' ? Palette.cloud : Palette.charcoal)
                    : c.text,
                }}>
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable
        onPress={onFilterPress}
        accessibilityLabel="Filter routines"
        style={({ pressed }) => ({
          width: 36,
          height: 36,
          borderRadius: Radii.pill,
          backgroundColor: Palette.kangkong,
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: 8,
          opacity: pressed ? 0.7 : 1,
        })}>
        <Ionicons name="options-outline" size={18} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}
