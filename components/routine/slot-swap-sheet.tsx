import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Borders, Colors, Palette, Radii } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Meal } from '@/types/meals';
import type { SlotAlternative } from '@/types/routine';

interface ActivitySwapProps {
  kind: 'activity';
  currentTitle: string;
  alternatives: SlotAlternative[];
  onSelect: (alt: SlotAlternative) => void;
  onClose: () => void;
}

interface MealSwapProps {
  kind: 'meal';
  currentTitle: string;
  alternatives: Meal[];
  onSelect: (meal: Meal) => void;
  onClose: () => void;
}

type Props = ActivitySwapProps | MealSwapProps;

export function SlotSwapSheet(props: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  return (
    <View
      style={{
        backgroundColor: c.surface,
        borderTopLeftRadius: Radii.lg,
        borderTopRightRadius: Radii.lg,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 32,
        maxHeight: 420,
      }}>
      {/* Handle bar */}
      <View
        style={{
          width: 40,
          height: 4,
          borderRadius: 2,
          backgroundColor: Borders.hairline[scheme],
          alignSelf: 'center',
          marginBottom: 16,
        }}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: c.text }}>
          Swap: {props.currentTitle}
        </Text>
        <Pressable onPress={props.onClose} hitSlop={12}>
          <Ionicons name="close" size={22} color={c.iconMuted} />
        </Pressable>
      </View>

      <Text style={{ fontSize: 13, color: c.iconMuted, marginBottom: 12 }}>
        Choose an alternative:
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {props.kind === 'activity' &&
          (props as ActivitySwapProps).alternatives.map((alt, i) => (
            <Pressable
              key={i}
              onPress={() => (props as ActivitySwapProps).onSelect(alt)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: c.background,
                borderRadius: Radii.md,
                padding: 14,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: Borders.hairline[scheme],
                opacity: pressed ? 0.8 : 1,
              })}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: c.text }}>{alt.title}</Text>
                <Text style={{ fontSize: 12, color: c.iconMuted, marginTop: 2 }}>
                  {alt.durationMinutes} min · {alt.intensity}
                </Text>
                {alt.description && (
                  <Text style={{ fontSize: 12, color: c.iconMuted, marginTop: 2 }}>{alt.description}</Text>
                )}
              </View>
              <Ionicons name="swap-horizontal" size={18} color={Palette.kangkong} />
            </Pressable>
          ))}

        {props.kind === 'meal' &&
          (props as MealSwapProps).alternatives.map((meal, i) => (
            <Pressable
              key={i}
              onPress={() => (props as MealSwapProps).onSelect(meal)}
              style={({ pressed }) => ({
                backgroundColor: c.background,
                borderRadius: Radii.md,
                padding: 14,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: Borders.hairline[scheme],
                opacity: pressed ? 0.8 : 1,
              })}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: c.text }}>{meal.name}</Text>
                  {meal.nameTagalog && (
                    <Text style={{ fontSize: 12, color: c.iconMuted }}>{meal.nameTagalog}</Text>
                  )}
                  <Text style={{ fontSize: 12, color: c.iconMuted, marginTop: 2 }}>
                    {meal.calories ? `${meal.calories} kcal · ` : ''}{meal.prepMinutes} min prep
                    {meal.estimatedCostPhp ? ` · ~₱${Math.round(meal.estimatedCostPhp)}` : ''}
                  </Text>
                </View>
                <Ionicons name="swap-horizontal" size={18} color={Palette.kangkong} />
              </View>
            </Pressable>
          ))}
      </ScrollView>
    </View>
  );
}
