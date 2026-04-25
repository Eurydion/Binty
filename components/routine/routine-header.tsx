import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface Props {
  selectedDate: Date;
  onMonthPress?: () => void;
}

export function RoutineHeader({ selectedDate, onMonthPress }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const monthLabel = MONTH_NAMES[selectedDate.getMonth()];

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
      <View>
        <Text
          style={{
            fontSize: 28,
            fontWeight: '700',
            color: c.text,
            letterSpacing: -0.5,
          }}>
          Routine
        </Text>
        <Pressable
          onPress={onMonthPress}
          style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: c.text }}>
            {monthLabel}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={c.text}
            style={{ marginLeft: 4 }}
          />
        </Pressable>
      </View>

      <Pressable
        accessibilityLabel="Profile"
        style={({ pressed }) => ({
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: scheme === 'light' ? '#E8E8E8' : '#3A3A3A',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.7 : 1,
          marginTop: 4,
        })}>
        <Ionicons name="person-outline" size={18} color={c.iconMuted} />
      </Pressable>
    </View>
  );
}
