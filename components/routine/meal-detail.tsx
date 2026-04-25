import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { Borders, Colors, Palette, Radii } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Meal } from '@/types/meals';

interface Props {
  meal: Meal;
  onChangeMeal?: () => void;
}

export function MealDetail({ meal, onChangeMeal }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  return (
    <View
      style={{
        backgroundColor: c.surface,
        borderRadius: Radii.lg,
        padding: 16,
        marginTop: 8,
        borderWidth: 1,
        borderColor: Borders.hairline[scheme],
      }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: c.text }}>{meal.name}</Text>
          {meal.nameTagalog && (
            <Text style={{ fontSize: 13, color: c.iconMuted, marginTop: 2 }}>{meal.nameTagalog}</Text>
          )}
        </View>
        {onChangeMeal && (
          <Pressable
            onPress={onChangeMeal}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              opacity: pressed ? 0.7 : 1,
            })}>
            <Ionicons name="swap-horizontal" size={16} color={Palette.kangkong} />
            <Text style={{ fontSize: 12, fontWeight: '600', color: Palette.kangkong }}>Change</Text>
          </Pressable>
        )}
      </View>

      {/* Stats row */}
      <View style={{ flexDirection: 'row', gap: 16, marginTop: 12, marginBottom: 14 }}>
        {meal.calories != null && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="flame-outline" size={14} color={Palette.kamote} />
            <Text style={{ fontSize: 12, fontWeight: '600', color: c.text }}>{meal.calories} kcal</Text>
          </View>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="time-outline" size={14} color={Palette.teal} />
          <Text style={{ fontSize: 12, fontWeight: '600', color: c.text }}>{meal.prepMinutes} min</Text>
        </View>
        {meal.estimatedCostPhp != null && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="wallet-outline" size={14} color={Palette.kangkong} />
            <Text style={{ fontSize: 12, fontWeight: '600', color: c.text }}>~₱{Math.round(meal.estimatedCostPhp)}</Text>
          </View>
        )}
      </View>

      {/* Ingredients */}
      <Text style={{ fontSize: 13, fontWeight: '700', color: c.text, marginBottom: 6 }}>Ingredients</Text>
      {meal.ingredients.map((ing, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 4,
            borderBottomWidth: i < meal.ingredients.length - 1 ? 1 : 0,
            borderBottomColor: Borders.hairline[scheme],
          }}>
          <Text style={{ fontSize: 13, color: c.text }}>{ing.name}</Text>
          <Text style={{ fontSize: 13, color: c.iconMuted }}>
            {ing.quantity} {ing.unit}
            {ing.marketPricePerUnit ? ` · ₱${Math.round(ing.marketPricePerUnit * ing.quantity)}` : ''}
          </Text>
        </View>
      ))}

      {/* Recipe */}
      {meal.recipe && (
        <View style={{ marginTop: 14 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: c.text, marginBottom: 6 }}>Recipe</Text>
          <Text style={{ fontSize: 13, color: c.text, lineHeight: 20 }}>{meal.recipe}</Text>
        </View>
      )}

      {/* Tags */}
      {meal.tags.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
          {meal.tags.map((tag) => (
            <View
              key={tag}
              style={{
                backgroundColor: scheme === 'light' ? '#F0F0F0' : '#333',
                borderRadius: Radii.pill,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: c.iconMuted }}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
