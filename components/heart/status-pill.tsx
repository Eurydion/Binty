import { Text, View } from 'react-native';

import { Radii } from '@/constants/theme';

interface Props {
  label: string;
  color: string;
  size?: 'sm' | 'md';
}

export function StatusPill({ label, color, size = 'sm' }: Props) {
  const padX = size === 'sm' ? 10 : 14;
  const padY = size === 'sm' ? 4 : 6;
  const fontSize = size === 'sm' ? 11 : 12;
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: color + '22',
        paddingHorizontal: padX,
        paddingVertical: padY,
        borderRadius: Radii.pill,
      }}
    >
      <Text style={{ color, fontSize, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}
