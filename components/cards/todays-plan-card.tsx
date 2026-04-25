import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Borders, Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRoutineStore } from '@/store/use-routine-store';
import type { RoutineSlot } from '@/types/routine';

function slotTitle(slot: RoutineSlot): string {
  if (slot.type === 'meal') {
    return slot.mealType.charAt(0).toUpperCase() + slot.mealType.slice(1);
  }
  if (slot.type === 'hydration') {
    return `Drink ${slot.targetMl}ml`;
  }
  return slot.title;
}

function slotIcon(slot: RoutineSlot): React.ComponentProps<typeof Ionicons>['name'] {
  if (slot.type === 'meal') return 'restaurant-outline';
  if (slot.type === 'hydration') return 'water-outline';
  if (slot.type === 'rest') return 'moon-outline';
  return 'fitness-outline';
}

export function TodaysPlanCard() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const router = useRouter();
  const routine = useRoutineStore((s) => s.routine);

  const upcoming: RoutineSlot[] = routine
    ? routine.blocks.flatMap((b) => b.slots).filter((s) => !s.completed).slice(0, 3)
    : [];

  const adapted = !!routine?.adaptedAt;

  return (
    <View
      style={{
        marginHorizontal: 24,
        backgroundColor: c.surface,
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: Borders.hairline[scheme],
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>
          Today&apos;s Plan
        </Text>
        {adapted && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: Palette.kamote + '22',
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 9999,
            }}>
            <Ionicons name="sparkles" size={11} color={Palette.kamote} />
            <Text
              style={{
                marginLeft: 4,
                color: Palette.kamote,
                fontSize: 10,
                fontWeight: '700',
              }}>
              Adjusted for stress
            </Text>
          </View>
        )}
      </View>

      {upcoming.length === 0 ? (
        <Text style={{ color: c.iconMuted, fontSize: 13, paddingVertical: 8 }}>
          All caught up — nothing scheduled.
        </Text>
      ) : (
        <View style={{ gap: 10 }}>
          {upcoming.map((slot) => (
            <View
              key={slot.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 4,
              }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9999,
                  backgroundColor: Palette.kangkong + '1A',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                <Ionicons name={slotIcon(slot)} size={18} color={Palette.kangkong} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, fontSize: 14, fontWeight: '600' }}>
                  {slotTitle(slot)}
                </Text>
                <Text style={{ color: c.iconMuted, fontSize: 12, marginTop: 1 }}>
                  {slot.time}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <Pressable
        onPress={() => router.push('/(tabs)/routine')}
        accessibilityRole="button"
        accessibilityLabel="Start routine"
        style={({ pressed }) => ({
          marginTop: 16,
          backgroundColor: Palette.kangkong,
          borderRadius: 9999,
          paddingVertical: 12,
          alignItems: 'center',
          opacity: pressed ? 0.85 : 1,
        })}>
        <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
          Start Routine
        </Text>
      </Pressable>
    </View>
  );
}
