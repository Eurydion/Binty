import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, Text, View } from 'react-native';

import { Borders, Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHealthStore } from '@/store/use-health-store';

interface Props {
  bpm: number;
}

function getStatus(bpm: number): { label: string; color: string } {
  if (bpm < 60) return { label: 'Low', color: Palette.silverBlue };
  if (bpm <= 100) return { label: 'Normal', color: Palette.kangkong };
  if (bpm <= 120) return { label: 'Elevated', color: Palette.kamote };
  return { label: 'High', color: Palette.kamote };
}

const STEP = 5;

export function HeartBpmCard({ bpm }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const status = getStatus(bpm);
  const adjustBpm = useHealthStore((s) => s.adjustBpm);

  const onAdjust = (delta: number) => {
    if (Platform.OS === 'ios') {
      Haptics.selectionAsync();
    }
    adjustBpm(delta);
  };

  const StepperButton = ({
    label,
    icon,
    onPress,
  }: {
    label: string;
    icon: 'remove' | 'add';
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => ({
        width: 26,
        height: 26,
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: Borders.hairline[scheme],
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Ionicons name={icon} size={14} color={c.iconMuted} />
    </Pressable>
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: c.surface,
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: Borders.hairline[scheme],
        justifyContent: 'space-between',
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="heart" size={20} color={status.color} />
          <Text
            style={{
              marginLeft: 6,
              fontSize: 12,
              fontWeight: '600',
              color: c.iconMuted,
            }}>
            Heart Rate
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <StepperButton
            label="Decrease BPM"
            icon="remove"
            onPress={() => onAdjust(-STEP)}
          />
          <StepperButton
            label="Increase BPM"
            icon="add"
            onPress={() => onAdjust(STEP)}
          />
        </View>
      </View>

      <View>
        <Text style={{ fontSize: 32, fontWeight: '700', color: c.text }}>
          {bpm}
          <Text style={{ fontSize: 14, fontWeight: '500', color: c.iconMuted }}>
            {' '}
            BPM
          </Text>
        </Text>
      </View>

      <View
        style={{
          alignSelf: 'flex-start',
          backgroundColor: status.color + '22',
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 9999,
        }}>
        <Text style={{ color: status.color, fontSize: 11, fontWeight: '700' }}>
          {status.label}
        </Text>
      </View>
    </View>
  );
}
