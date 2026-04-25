import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';

import { Borders, Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { FloatingBubble } from '../effects/FloatingBubble';

interface Props {
  loggedMl: number;
  goalMl: number;
}

const WATER_DEEP = '#3F8DC4';
const WATER_MID = '#5BA3D6';
const WATER_LIGHT = '#8FC3E8';

export function WaterIntakeCard({ loggedMl, goalMl }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const router = useRouter();

  const pct = Math.max(0, Math.min(1, loggedMl / goalMl));
  const litres = (loggedMl / 1000).toFixed(1);

  const fillAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: pct,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 3200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const fillHeight = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const waveTranslate = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-14, 14],
  });

  const isFilled = pct >= 0.8;

  const textColor = isFilled ? '#FFFFFF' : c.text;
  const subColor = isFilled ? 'rgba(255,255,255,0.85)' : c.iconMuted;
  const iconColor = isFilled ? '#FFFFFF' : Palette.teal;

  let status = 'Hydration low';
  let statusColor: string = Palette.kamote;

  if (pct >= 1) {
    status = 'Goal met';
    statusColor = Palette.kangkong;
  } else if (pct >= 0.5) {
    status = 'On track';
    statusColor = Palette.teal;
  }

  return (
    <Pressable
      onPress={() => router.push('/modals/log-water')}
      style={({ pressed }) => ({
        flex: 1,
        aspectRatio: 1,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: c.surface,
        borderWidth: 1,
        borderColor: Borders.hairline[scheme],
        opacity: pressed ? 0.94 : 1,
      })}
    >
      {/* 🌊 WATER LAYER */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: fillHeight,
          backgroundColor: WATER_MID,
        }}
      >
        {/* Deep gradient */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '60%',
            backgroundColor: WATER_DEEP,
            opacity: 0.35,
          }}
        />

        {/* Wave */}
        <Animated.View
          style={{
            position: 'absolute',
            top: -10,
            left: -30,
            right: -30,
            height: 20,
            borderRadius: 9999,
            backgroundColor: WATER_LIGHT,
            opacity: 0.7,
            transform: [{ translateX: waveTranslate }],
          }}
        />

        <Animated.View
          style={{
            position: 'absolute',
            top: -4,
            left: -20,
            right: -20,
            height: 14,
            borderRadius: 9999,
            backgroundColor: WATER_MID,
            opacity: 0.95,
            transform: [{ translateX: waveTranslate }],
          }}
        />

        {/* 🫧 FLOATING BUBBLES (IMPORTANT: inside water layer) */}
        <FloatingBubble left={18} size={5} duration={4000} delay={0} opacity={0.5} />
        <FloatingBubble left={32} size={3} duration={5200} delay={800} opacity={0.4} />
        <FloatingBubble left={55} size={4} duration={4500} delay={1200} opacity={0.45} />
        <FloatingBubble left={80} size={2.5} duration={6000} delay={400} opacity={0.35} />
        <FloatingBubble left={120} size={3.5} duration={5000} delay={2000} opacity={0.5} />
      </Animated.View>

      {/* 🧱 CONTENT */}
      <View
        style={{
          flex: 1,
          padding: 16,
          justifyContent: 'space-between',
        }}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="water" size={20} color={iconColor} />
            <Text style={{ marginLeft: 6, fontSize: 12, fontWeight: '600', color: subColor }}>
              Water Intake
            </Text>
          </View>

          <Ionicons name="add" size={14} color={iconColor} />
        </View>

        {/* Value */}
        <View>
          <Text style={{ fontSize: 32, fontWeight: '700', color: textColor }}>
            {litres}{' '}
            <Text style={{ fontSize: 14, fontWeight: '500', color: subColor }}>
              L
            </Text>
          </Text>

          <Text style={{ fontSize: 11, marginTop: 2, color: subColor }}>
            of {(goalMl / 1000).toFixed(1)}L goal
          </Text>
        </View>

        {/* Status */}
        <View
          style={{
            alignSelf: 'flex-start',
            backgroundColor: '#FFFFFF',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 9999,
          }}
        >
          <Text style={{ color: statusColor, fontSize: 11, fontWeight: '700' }}>
            {status}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}