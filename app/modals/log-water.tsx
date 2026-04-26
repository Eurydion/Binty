import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';

import { Borders, Colors, Palette, Radii, Spacing, Surfaces } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRoutineStore } from '@/store/use-routine-store';

interface WaterOption {
  ml: number;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  glasses: number;
}

const WATER_OPTIONS: WaterOption[] = [
  { ml: 150, label: 'Small Cup', icon: 'cafe-outline', glasses: 0.6 },
  { ml: 250, label: '1 Glass', icon: 'water-outline', glasses: 1 },
  { ml: 350, label: 'Tall Glass', icon: 'pint-outline', glasses: 1.4 },
  { ml: 500, label: 'Bottle', icon: 'flask-outline', glasses: 2 },
  { ml: 750, label: 'Large Bottle', icon: 'beaker-outline', glasses: 3 },
  { ml: 1000, label: '1 Litre', icon: 'water', glasses: 4 },
];

function formatAmount(ml: number): string {
  return ml >= 1000 ? `${(ml / 1000).toFixed(1)}L` : `${ml}ml`;
}

function WaterOptionTile({
  option,
  onPress,
  scheme,
}: {
  option: WaterOption;
  onPress: () => void;
  scheme: 'light' | 'dark';
}) {
  const c = Colors[scheme];
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.96,
      duration: 120,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '47%' }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          backgroundColor: Surfaces[scheme].accent.silverBlue,
          borderRadius: Radii.lg,
          borderWidth: 1,
          borderColor: Borders.hairline[scheme],
          padding: Spacing.lg,
          alignItems: 'center',
          gap: Spacing.sm,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: Radii.pill,
            backgroundColor: scheme === 'light' ? 'rgba(167,199,231,0.35)' : 'rgba(167,199,231,0.15)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={option.icon} size={24} color={Palette.silverBlue} />
        </View>

        <Text
          style={{
            fontSize: 22,
            fontWeight: '700',
            color: c.text,
          }}
        >
          {formatAmount(option.ml)}
        </Text>

        <Text
          style={{
            fontSize: 12,
            fontWeight: '500',
            color: c.iconMuted,
          }}
        >
          {option.label}
        </Text>

        <View
          style={{
            backgroundColor: scheme === 'light' ? '#FFFFFF' : Surfaces.dark.raised,
            paddingHorizontal: Spacing.sm,
            paddingVertical: Spacing.xs,
            borderRadius: Radii.pill,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: '600',
              color: Palette.teal,
            }}
          >
            {option.glasses === 1
              ? '1 glass'
              : option.glasses % 1 === 0
                ? `${option.glasses} glasses`
                : `≈ ${option.glasses} glasses`}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function LogWaterModal() {
  const router = useRouter();
  const logWater = useRoutineStore((s) => s.logWater);
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  function handleLog(ml: number) {
    logWater(ml);
    router.back();
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: c.background,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          color: c.iconMuted,
          marginBottom: Spacing.xl,
        }}
      >
        How much did you drink?
      </Text>

      {/* Option Grid */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          rowGap: Spacing.md,
        }}
      >
        {WATER_OPTIONS.map((option) => (
          <WaterOptionTile
            key={option.ml}
            option={option}
            onPress={() => handleLog(option.ml)}
            scheme={scheme}
          />
        ))}
      </View>

    </View>
  );
}
