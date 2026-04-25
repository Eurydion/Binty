import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Borders, Colors, Palette, Radii, Spacing } from '@/constants/theme';
import type { Trigger, TriggerKind } from '@/features/wellness-engine/triggers';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCheckInStore } from '@/store/use-check-in-store';

type Feeling = 'great' | 'okay' | 'tense' | 'anxious' | 'low';

const FEELINGS: { id: Feeling; label: string; emoji: string; tint: string; kind: TriggerKind }[] = [
  { id: 'great', label: 'Great', emoji: '😄', tint: Palette.kangkong, kind: 'good-streak' },
  { id: 'okay', label: 'Okay', emoji: '🙂', tint: Palette.silverBlue, kind: 'sedentary' },
  { id: 'tense', label: 'Tense', emoji: '😬', tint: Palette.kamote, kind: 'stress-spike' },
  { id: 'anxious', label: 'Anxious', emoji: '😣', tint: Palette.teal, kind: 'anxiety-spike' },
  { id: 'low', label: 'Low', emoji: '😢', tint: '#C97B6E', kind: 'low-energy' },
];

const TAGS = ['Tired', 'Worried', 'Lonely', 'Restless', 'Overwhelmed', 'Hungry', 'Bored', 'Excited'];

export default function SelfCheckInModal() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const demoTrigger = useCheckInStore((s) => s.demoTrigger);

  const [feeling, setFeeling] = useState<Feeling | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  const toggleTag = (t: string) => {
    setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  };

  const submit = () => {
    if (!feeling) return;
    const meta = FEELINGS.find((f) => f.id === feeling)!;
    const reason =
      tags.length > 0
        ? `You said you feel ${feeling}${tags.length ? ` (${tags.join(', ').toLowerCase()})` : ''}.`
        : `You said you feel ${feeling}.`;

    const severity: Trigger['severity'] =
      feeling === 'anxious' || feeling === 'tense' ? 'moderate' : 'mild';

    const trigger: Trigger = {
      kind: meta.kind,
      severity,
      state:
        feeling === 'anxious'
          ? 'anxious'
          : feeling === 'tense'
          ? 'stressed'
          : feeling === 'low'
          ? 'sad'
          : feeling === 'great'
          ? 'energized'
          : 'calm',
      reason,
      detectedAt: Date.now(),
    };

    demoTrigger(trigger);
    router.replace('/modals/check-in');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: Spacing.xl, paddingBottom: 40 }}
      >
        <Text style={{ color: c.iconMuted, fontSize: 11, fontWeight: '800', letterSpacing: 0.7 }}>
          QUICK CHECK-IN
        </Text>
        <Text style={{ color: c.text, fontSize: 28, fontWeight: '800', marginTop: 6 }}>
          How are you feeling right now?
        </Text>
        <Text style={{ color: c.iconMuted, fontSize: 14, marginTop: 8 }}>
          No smartwatch needed. Tell Binty and we&apos;ll help.
        </Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: Spacing.xl,
          }}
        >
          {FEELINGS.map((f) => {
            const sel = feeling === f.id;
            return (
              <Pressable
                key={f.id}
                onPress={() => setFeeling(f.id)}
                style={({ pressed }) => ({
                  alignItems: 'center',
                  flex: 1,
                  opacity: pressed ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                })}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: Radii.pill,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: sel ? f.tint + '24' : 'transparent',
                    borderWidth: sel ? 2 : 1,
                    borderColor: sel ? f.tint : Borders.hairline[scheme],
                  }}
                >
                  <Text style={{ fontSize: 28 }}>{f.emoji}</Text>
                </View>
                <Text
                  style={{
                    color: sel ? c.text : c.iconMuted,
                    fontSize: 11,
                    fontWeight: sel ? '800' : '600',
                    marginTop: 6,
                  }}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text
          style={{
            color: c.iconMuted,
            fontSize: 11,
            fontWeight: '800',
            letterSpacing: 0.7,
            marginTop: Spacing.xl,
            marginBottom: 10,
          }}
        >
          ANYTHING SPECIFIC? (OPTIONAL)
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {TAGS.map((t) => {
            const sel = tags.includes(t);
            return (
              <Pressable
                key={t}
                onPress={() => toggleTag(t)}
                style={({ pressed }) => ({
                  paddingHorizontal: 14,
                  paddingVertical: 9,
                  borderRadius: Radii.pill,
                  backgroundColor: sel ? Palette.kangkong + '22' : c.surface,
                  borderWidth: 1,
                  borderColor: sel ? Palette.kangkong : Borders.hairline[scheme],
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text
                  style={{
                    color: c.text,
                    fontSize: 13,
                    fontWeight: sel ? '700' : '600',
                  }}
                >
                  {t}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View
        style={{
          flexDirection: 'row',
          gap: 10,
          padding: Spacing.xl,
          paddingTop: Spacing.md,
          borderTopWidth: 1,
          borderTopColor: Borders.hairline[scheme],
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            paddingHorizontal: 20,
            paddingVertical: 14,
            borderRadius: Radii.md,
            backgroundColor: c.surface,
            borderWidth: 1,
            borderColor: Borders.hairline[scheme],
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Ionicons name="close" size={18} color={c.text} />
        </Pressable>
        <Pressable
          onPress={submit}
          disabled={!feeling}
          style={({ pressed }) => ({
            flex: 1,
            paddingVertical: 14,
            borderRadius: Radii.md,
            backgroundColor: feeling ? Palette.kangkong : c.iconMuted,
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>
            Get a routine
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
