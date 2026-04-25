import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Borders, Colors, Palette, Radii, Spacing } from '@/constants/theme';
import { stopUrgentAlert } from '@/features/alerts/play-alert';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCheckInStore } from '@/store/use-check-in-store';

const TRIGGER_COPY: Record<
  string,
  { title: string; body: string; icon: 'pulse' | 'flash' | 'water' | 'walk' | 'sparkles' | 'leaf' }
> = {
  'anxiety-spike': {
    title: 'Are you okay?',
    body: 'Binty noticed your heart rate is elevated and your HRV is low — a sign of anxiety. Want a quick reset?',
    icon: 'pulse',
  },
  'stress-spike': {
    title: 'You seem stressed.',
    body: 'Your stress index is high. A 60-second pause can help your nervous system settle.',
    icon: 'flash',
  },
  'low-energy': {
    title: 'Feeling low?',
    body: "You've been still for a while. A short walk or stretch can lift your energy.",
    icon: 'leaf',
  },
  'dehydration-risk': {
    title: 'Time to hydrate',
    body: "You're behind on water today. A glass now will help focus and energy.",
    icon: 'water',
  },
  sedentary: {
    title: 'Move a little',
    body: 'Low movement so far. Even 2 minutes of walking helps.',
    icon: 'walk',
  },
  'good-streak': {
    title: 'You\u2019re in a great rhythm!',
    body: 'Body regulated, stress low. Whatever you\u2019re doing — keep it up.',
    icon: 'sparkles',
  },
};

export default function CheckInModal() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const trigger = useCheckInStore((s) => s.active);
  const dismiss = useCheckInStore((s) => s.dismiss);

  // Safety net: if the modal is unmounted by any path
  // (Android back button, OS gesture), make sure the alarm dies.
  // MUST stay above any early return so hook order is stable.
  useEffect(() => {
    return () => {
      stopUrgentAlert();
    };
  }, []);

  if (!trigger) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: c.iconMuted }}>No active check-in.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: Palette.kangkong, fontWeight: '700' }}>Close</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const copy = TRIGGER_COPY[trigger.kind] ?? TRIGGER_COPY['stress-spike'];
  const accent = trigger.kind === 'anxiety-spike' ? Palette.teal : Palette.kamote;

  const handleBreathing = () => {
    stopUrgentAlert();
    router.replace('/modals/breathing');
  };
  const handleGrounding = () => {
    stopUrgentAlert();
    router.replace('/modals/grounding');
  };
  const handleOk = () => {
    stopUrgentAlert();
    dismiss();
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1, padding: Spacing.xl, justifyContent: 'space-between' }}>
        <View>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: Radii.pill,
              backgroundColor: accent + '24',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: Spacing.lg,
            }}
          >
            <Ionicons name={`${copy.icon}-outline` as any} size={28} color={accent} />
          </View>

          <Text style={{ color: c.iconMuted, fontSize: 11, fontWeight: '800', letterSpacing: 0.7 }}>
            BINTY CHECK-IN · {trigger.severity.toUpperCase()}
          </Text>
          <Text style={{ color: c.text, fontSize: 26, fontWeight: '800', marginTop: 8, lineHeight: 32 }}>
            {copy.title}
          </Text>
          <Text style={{ color: c.text, fontSize: 15, marginTop: 12, lineHeight: 22, opacity: 0.8 }}>
            {copy.body}
          </Text>

          <View
            style={{
              marginTop: Spacing.lg,
              padding: Spacing.md,
              borderRadius: Radii.md,
              backgroundColor: c.surface,
              borderWidth: 1,
              borderColor: Borders.hairline[scheme],
            }}
          >
            <Text style={{ color: c.iconMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>
              WHAT BINTY SAW
            </Text>
            <Text style={{ color: c.text, fontSize: 13, marginTop: 4 }}>{trigger.reason}</Text>
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <Pressable
            onPress={handleBreathing}
            style={({ pressed }) => ({
              backgroundColor: accent,
              borderRadius: Radii.md,
              paddingVertical: 16,
              alignItems: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>
              Try a 60-second breath
            </Text>
          </Pressable>
          <Pressable
            onPress={handleGrounding}
            style={({ pressed }) => ({
              backgroundColor: c.surface,
              borderRadius: Radii.md,
              paddingVertical: 16,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: Borders.hairline[scheme],
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ color: c.text, fontWeight: '700', fontSize: 15 }}>
              Try a grounding exercise
            </Text>
          </Pressable>
          <Pressable onPress={handleOk} hitSlop={10} style={{ alignItems: 'center', paddingVertical: 12 }}>
            <Text style={{ color: c.iconMuted, fontWeight: '600', fontSize: 14 }}>I&apos;m okay, dismiss</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
