import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { DotPattern } from '@/components/effects/dot-pattern';
import { NoiseOverlay } from '@/components/effects/noise-overlay';
import { Palette, Radii, Spacing } from '@/constants/theme';

export function LearnMoreCard() {
  const router = useRouter();

  return (
    <View style={{ paddingHorizontal: 24 }}>
      <Pressable
        onPress={() => router.push('/modals/insights')}
        style={({ pressed }) => ({
          borderRadius: Radii.lg,
          padding: Spacing.lg,
          backgroundColor: Palette.kangkong,
          opacity: pressed ? 0.9 : 1,
          overflow: 'hidden',
        })}
      >
        <DotPattern color="#FFFFFF" opacity={0.18} spacing={18} radius={1.4} />
        <NoiseOverlay opacity={0.06} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexShrink: 1, paddingRight: 12 }}>
            <Text style={{ color: Palette.cloud, fontSize: 16, fontWeight: '700', marginBottom: 4 }}>
              Understand Your Body Better
            </Text>
            <Text style={{ color: Palette.cloud, opacity: 0.85, fontSize: 12, lineHeight: 16 }}>
              Learn what your heart rate, stress, and recovery numbers actually mean.
            </Text>
          </View>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 9999,
              backgroundColor: 'rgba(255,255,255,0.18)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="arrow-forward" size={18} color={Palette.cloud} />
          </View>
        </View>
      </Pressable>
    </View>
  );
}
