import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { MascotPortrait } from '@/components/home/mascot-portrait';
import { Borders, Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/features/hooks/use-color-scheme';
import type { EmotionalState } from '@/types/health';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const STATE_MAP: Record<
  EmotionalState,
  { icon: IoniconName; message: string; accent: string }
> = {
  calm: {
    icon: 'happy-outline',
    message: "You're calm today. Keep it going.",
    accent: Palette.kangkong,
  },
  energized: {
    icon: 'sunny-outline',
    message: 'Strong energy! Make the most of it.',
    accent: Palette.kamote,
  },
  anxious: {
    icon: 'alert-circle-outline',
    message: 'You seem a bit anxious. Take a breath.',
    accent: Palette.teal,
  },
  stressed: {
    icon: 'sad-outline',
    message: 'You seem stressed. I adjusted your routine.',
    accent: Palette.kamote,
  },
  sad: {
    icon: 'rainy-outline',
    message: 'Feeling low? Some gentle movement can help.',
    accent: Palette.silverBlue,
  },
};

interface Props {
  state: EmotionalState;
}

export function BintyInsight({ state }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const meta = STATE_MAP[state];

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
          <Text
            style={{
              color: c.iconMuted,
              fontSize: 12,
              fontWeight: '700',
              letterSpacing: 0.6,
            }}
          >
            BINTY INSIGHT
          </Text>
          <Text
            style={{
              color: c.text,
              fontSize: 18,
              fontWeight: '600',
              marginTop: 6,
              lineHeight: 24,
            }}
          >
            {meta.message}
          </Text>
        </View>
      </View>
    </View>
  );
}
