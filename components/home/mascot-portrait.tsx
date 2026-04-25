import { Ionicons } from '@expo/vector-icons';
import { Image, Text, View } from 'react-native';

import { getMascotSource } from '@/features/mascot/mascot-map';
import type { EmotionalState } from '@/types/health';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface Props {
  state: EmotionalState;
  size?: number;
  accent: string;
  fallbackIcon?: IoniconName;
}

export function MascotPortrait({ state, size = 96, accent, fallbackIcon = 'happy-outline' }: Props) {
  const source = getMascotSource(state);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: accent + '22',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
      accessibilityRole="image"
      accessibilityLabel={`Binty mascot — ${state}`}
    >
      {source ? (
        <Image
          source={source}
          style={{ width: size, height: size }}
          resizeMode="cover"
        />
      ) : (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={fallbackIcon} size={size * 0.5} color={accent} />
          <Text
            style={{
              position: 'absolute',
              bottom: -size * 0.02,
              fontSize: size * 0.18,
              fontWeight: '700',
              color: accent,
              opacity: 0.6,
            }}
          >
            B
          </Text>
        </View>
      )}
    </View>
  );
}
