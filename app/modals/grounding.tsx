import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Borders, Colors, Palette, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCheckInStore } from '@/store/use-check-in-store';

// 5-4-3-2-1 grounding technique
const STEPS = [
  { count: 5, sense: 'see', prompt: 'Name 5 things you can see.' },
  { count: 4, sense: 'feel', prompt: 'Name 4 things you can feel or touch.' },
  { count: 3, sense: 'hear', prompt: 'Name 3 things you can hear.' },
  { count: 2, sense: 'smell', prompt: 'Name 2 things you can smell.' },
  { count: 1, sense: 'taste', prompt: 'Name 1 thing you can taste.' },
];

export default function GroundingModal() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const dismiss = useCheckInStore((s) => s.dismiss);

  const [stepIdx, setStepIdx] = useState(0);
  const isLast = stepIdx >= STEPS.length - 1;
  const done = stepIdx >= STEPS.length;

  const next = () => setStepIdx((i) => i + 1);
  const finish = () => {
    dismiss();
    router.back();
  };

  if (done) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl }}>
          <Text style={{ color: Palette.kangkong, fontSize: 64 }}>🌿</Text>
          <Text style={{ color: c.text, fontSize: 24, fontWeight: '800', marginTop: 12 }}>You&apos;re here.</Text>
          <Text style={{ color: c.text, opacity: 0.7, fontSize: 15, marginTop: 8, textAlign: 'center' }}>
            You just brought yourself back to the present moment.
          </Text>
          <Pressable
            onPress={finish}
            style={({ pressed }) => ({
              backgroundColor: Palette.kangkong,
              borderRadius: Radii.md,
              paddingVertical: 16,
              paddingHorizontal: 32,
              marginTop: Spacing.xl,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>I feel grounded</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const step = STEPS[stepIdx];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1, padding: Spacing.xl, justifyContent: 'space-between' }}>
        <View>
          <Text style={{ color: c.iconMuted, fontSize: 11, fontWeight: '800', letterSpacing: 0.7 }}>
            5 · 4 · 3 · 2 · 1 GROUNDING
          </Text>
          <Text style={{ color: c.text, fontSize: 22, fontWeight: '800', marginTop: 4 }}>
            Step {stepIdx + 1} of {STEPS.length}
          </Text>
        </View>

        <View style={{ alignItems: 'center' }}>
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 9999,
              backgroundColor: Palette.teal + '24',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: Palette.teal, fontSize: 56, fontWeight: '800' }}>{step.count}</Text>
          </View>
          <Text style={{ color: c.text, fontSize: 22, fontWeight: '700', marginTop: Spacing.xl, textAlign: 'center' }}>
            {step.prompt}
          </Text>
          <Text style={{ color: c.iconMuted, fontSize: 13, marginTop: 8 }}>
            Take your time. Say each one out loud.
          </Text>
        </View>

        <View style={{ gap: 10 }}>
          <Pressable
            onPress={next}
            style={({ pressed }) => ({
              backgroundColor: Palette.teal,
              borderRadius: Radii.md,
              paddingVertical: 16,
              alignItems: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>
              {isLast ? 'Done' : 'Next'}
            </Text>
          </Pressable>
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
      </View>
    </SafeAreaView>
  );
}
