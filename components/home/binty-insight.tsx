import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { MascotPortrait } from '@/components/home/mascot-portrait';
import { Borders, Colors, Palette } from '@/constants/theme';
import { pickInsight } from '@/features/wellness-engine/insight-messages';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUserStore } from '@/store/use-user-store';
import type { EmotionalState } from '@/types/health';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const STATE_META: Record<EmotionalState, { icon: IoniconName; accent: string; label: string }> = {
  calm: { icon: 'happy-outline', accent: Palette.kangkong, label: 'Calm' },
  energized: { icon: 'sunny-outline', accent: Palette.kamote, label: 'Energized' },
  anxious: { icon: 'alert-circle-outline', accent: Palette.teal, label: 'Anxious' },
  stressed: { icon: 'sad-outline', accent: Palette.kamote, label: 'Stressed' },
  sad: { icon: 'rainy-outline', accent: Palette.silverBlue, label: 'Low' },
};

interface Props {
  state: EmotionalState;
}

export function BintyInsight({ state }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const profile = useUserStore((s) => s.profile);
  const meta = STATE_META[state];
  const message = pickInsight(state, new Date().getHours(), profile.name);

  return (
    <View style={{ paddingHorizontal: 24 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: c.surface,
          borderRadius: 24,
          padding: 20,
          minHeight: 156,
          borderWidth: 1,
          borderColor: Borders.hairline[scheme],
        }}
      >
        <MascotPortrait
          state={state}
          size={104}
          accent={meta.accent}
          fallbackIcon={meta.icon}
        />

        <View style={{ flex: 1, marginLeft: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text
              style={{
                color: c.iconMuted,
                fontSize: 12,
                fontWeight: '700',
                letterSpacing: 0.6,
              }}
            >
              BINTY · {meta.label.toUpperCase()}
            </Text>
          </View>
          <Text
            style={{
              color: c.text,
              fontSize: 18,
              fontWeight: '600',
              marginTop: 6,
              lineHeight: 24,
            }}
          >
            {message}
          </Text>
        </View>
      </View>
    </View>
  );
}
