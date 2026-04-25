import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Borders, Colors, Palette, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const STEPS = [
  { area: 'Forehead & jaw', prompt: 'Soften the forehead. Unclench the jaw.', duration: 25 },
  { area: 'Shoulders & neck', prompt: 'Drop your shoulders away from your ears.', duration: 25 },
  { area: 'Chest & arms', prompt: 'Loosen the chest. Let your arms hang heavy.', duration: 25 },
  { area: 'Belly & back', prompt: 'Relax your belly. Release the lower back.', duration: 25 },
  { area: 'Legs & feet', prompt: 'Soften your legs. Feel your feet on the ground.', duration: 25 },
];

export default function BodyScanModal() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  const [stepIdx, setStepIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(STEPS[0].duration);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    if (secondsLeft <= 0) {
      const nextIdx = stepIdx + 1;
      if (nextIdx >= STEPS.length) {
        setDone(true);
        return;
      }
      setStepIdx(nextIdx);
      setSecondsLeft(STEPS[nextIdx].duration);
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, stepIdx, done]);

  const finish = () => router.back();

  if (done) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl }}>
          <Text style={{ fontSize: 64 }}>🌊</Text>
          <Text style={{ color: c.text, fontSize: 24, fontWeight: '800', marginTop: 12 }}>Released.</Text>
          <Text style={{ color: c.text, opacity: 0.7, fontSize: 15, marginTop: 8, textAlign: 'center' }}>
            Notice the difference. Your body is lighter.
          </Text>
          <Pressable
            onPress={finish}
            style={({ pressed }) => ({
              backgroundColor: Palette.kamote,
              borderRadius: Radii.md,
              paddingVertical: 16,
              paddingHorizontal: 32,
              marginTop: Spacing.xl,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>I feel relaxed</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const step = STEPS[stepIdx];
  const progress = (step.duration - secondsLeft) / step.duration;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1, padding: Spacing.xl, justifyContent: 'space-between' }}>
        <View>
          <Text style={{ color: c.iconMuted, fontSize: 11, fontWeight: '800', letterSpacing: 0.7 }}>
            BODY SCAN
          </Text>
          <Text style={{ color: c.text, fontSize: 22, fontWeight: '800', marginTop: 4 }}>
            Step {stepIdx + 1} of {STEPS.length}
          </Text>
        </View>

        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: Palette.kamote, fontSize: 14, fontWeight: '800', letterSpacing: 0.5 }}>
            {step.area.toUpperCase()}
          </Text>
          <Text
            style={{
              color: c.text,
              fontSize: 24,
              fontWeight: '700',
              marginTop: Spacing.lg,
              textAlign: 'center',
              lineHeight: 32,
            }}
          >
            {step.prompt}
          </Text>
          <Text style={{ color: c.iconMuted, fontSize: 36, fontWeight: '800', marginTop: Spacing.xl }}>
            {secondsLeft}s
          </Text>
          <View
            style={{
              width: '100%',
              height: 4,
              borderRadius: Radii.pill,
              backgroundColor: Borders.hairline[scheme],
              marginTop: Spacing.lg,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${progress * 100}%`,
                height: '100%',
                backgroundColor: Palette.kamote,
                borderRadius: Radii.pill,
              }}
            />
          </View>
        </View>

        <Pressable
          onPress={finish}
          style={({ pressed }) => ({
            backgroundColor: c.surface,
            borderRadius: Radii.md,
            paddingVertical: 14,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: Borders.hairline[scheme],
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ color: c.text, fontWeight: '700', fontSize: 14 }}>End early</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
