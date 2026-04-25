import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Borders, Colors, Palette, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Props {
  stress: number;
  sleepQualityScore: number;
}

function zoneFor(score: number): { label: string; color: string } {
  if (score >= 75) return { label: 'Ready', color: Palette.kangkong };
  if (score >= 50) return { label: 'Steady', color: Palette.teal };
  if (score >= 30) return { label: 'Low', color: Palette.kamote };
  return { label: 'Recover', color: '#D97757' };
}

export function RecoveryCard({ stress, sleepQualityScore }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const score = Math.round(0.6 * (100 - stress) + 0.4 * sleepQualityScore);
  const zone = zoneFor(score);

  const size = 88;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const dash = (score / 100) * circ;

  return (
    <View
      style={{
        flex: 1,
        aspectRatio: 1,
        backgroundColor: c.surface,
        borderRadius: Radii.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Borders.hairline[scheme],
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Ionicons name="leaf" size={16} color={zone.color} />
        <Text style={{ fontSize: 11, fontWeight: '700', color: c.iconMuted, letterSpacing: 0.4 }}>
          RECOVERY
        </Text>
      </View>

      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={Borders.hairline[scheme]}
            strokeWidth={stroke}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={zone.color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={circ / 4}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View
          style={{
            position: 'absolute',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: '700', color: c.text }}>{score}</Text>
        </View>
      </View>

      <View
        style={{
          alignSelf: 'flex-start',
          backgroundColor: zone.color + '22',
          paddingHorizontal: 10,
          paddingVertical: 3,
          borderRadius: Radii.pill,
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: '700', color: zone.color }}>{zone.label}</Text>
      </View>
    </View>
  );
}
