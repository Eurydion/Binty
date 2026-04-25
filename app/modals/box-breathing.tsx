import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Palette, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// 4-4-4-4 box breathing
const PHASES = [
  { label: 'Breathe in', duration: 4000, scale: 1.0 },
  { label: 'Hold', duration: 4000, scale: 1.0 },
  { label: 'Breathe out', duration: 4000, scale: 0.5 },
  { label: 'Hold', duration: 4000, scale: 0.5 },
];

const TOTAL_CYCLES = 4;

export default function BoxBreathingModal() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  const [cycle, setCycle] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [done, setDone] = useState(false);
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (done) return;
    const phase = PHASES[phaseIdx];
    Animated.timing(scale, {
      toValue: phase.scale,
      duration: phase.duration,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    const t = setTimeout(() => {
      const nextPhase = (phaseIdx + 1) % PHASES.length;
      if (nextPhase === 0) {
        const nextCycle = cycle + 1;
        if (nextCycle >= TOTAL_CYCLES) {
          setDone(true);
          return;
        }
        setCycle(nextCycle);
      }
      setPhaseIdx(nextPhase);
    }, phase.duration);

    return () => clearTimeout(t);
  }, [phaseIdx, cycle, done, scale]);

  const finish = () => router.back();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between', padding: Spacing.xl }}>
        <View style={{ alignItems: 'center', marginTop: Spacing.lg }}>
          <Text style={{ color: c.iconMuted, fontSize: 11, fontWeight: '800', letterSpacing: 0.7 }}>
            4 · 4 · 4 · 4 BOX BREATH
          </Text>
          <Text style={{ color: c.text, fontSize: 22, fontWeight: '800', marginTop: 4 }}>
            {done ? 'Centered.' : `Cycle ${cycle + 1} of ${TOTAL_CYCLES}`}
          </Text>
        </View>

        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View
            style={{
              width: 220,
              height: 220,
              borderRadius: 18,
              backgroundColor: Palette.kangkong + '33',
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale }],
            }}
          >
            <View
              style={{
                width: 180,
                height: 180,
                borderRadius: 14,
                backgroundColor: Palette.kangkong + '55',
              }}
            />
          </Animated.View>
          <Text style={{ color: c.text, fontSize: 24, fontWeight: '700', marginTop: Spacing.xl }}>
            {done ? 'Notice your focus.' : PHASES[phaseIdx].label}
          </Text>
        </View>

        <Pressable
          onPress={finish}
          style={({ pressed }) => ({
            backgroundColor: done ? Palette.kangkong : c.surface,
            borderRadius: Radii.md,
            paddingVertical: 16,
            paddingHorizontal: 32,
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1,
            alignSelf: 'stretch',
          })}
        >
          <Text style={{ color: done ? '#fff' : c.text, fontWeight: '800', fontSize: 15 }}>
            {done ? "I'm focused" : 'End early'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
