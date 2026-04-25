import { Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Props {
  title: string;
  subtitle?: string;
}

export function ScreenHeader({ title, subtitle }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  return (
    <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
      <Text
        style={{
          color: c.text,
          fontSize: 28,
          fontWeight: '700',
          letterSpacing: -0.3,
        }}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={{
            color: c.iconMuted,
            fontSize: 13,
            fontWeight: '500',
            marginTop: 4,
          }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
