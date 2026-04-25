import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Borders, Colors, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function GratitudeModal() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  const [items, setItems] = useState(['', '', '']);
  const [done, setDone] = useState(false);

  const update = (i: number, v: string) => {
    setItems((cur) => cur.map((x, idx) => (idx === i ? v : x)));
  };

  const filled = items.filter((x) => x.trim().length > 0).length;
  const finish = () => router.back();

  if (done) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl }}>
          <Text style={{ fontSize: 64 }}>💛</Text>
          <Text style={{ color: c.text, fontSize: 24, fontWeight: '800', marginTop: 12 }}>
            Thank you, {filled} good things.
          </Text>
          <Text style={{ color: c.text, opacity: 0.7, fontSize: 15, marginTop: 8, textAlign: 'center' }}>
            Studies show this simple act lifts mood for hours.
          </Text>
          <Pressable
            onPress={finish}
            style={({ pressed }) => ({
              backgroundColor: '#C97B6E',
              borderRadius: Radii.md,
              paddingVertical: 16,
              paddingHorizontal: 32,
              marginTop: Spacing.xl,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Done</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: Spacing.xl, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ color: c.iconMuted, fontSize: 11, fontWeight: '800', letterSpacing: 0.7 }}>
          THREE GOOD THINGS
        </Text>
        <Text style={{ color: c.text, fontSize: 26, fontWeight: '800', marginTop: 4 }}>
          What went well today?
        </Text>
        <Text style={{ color: c.iconMuted, fontSize: 14, marginTop: 8 }}>
          Three small things. Specific is better than big.
        </Text>

        <View style={{ marginTop: Spacing.xl, gap: 14 }}>
          {items.map((v, i) => (
            <View key={i}>
              <Text style={{ color: c.iconMuted, fontSize: 11, fontWeight: '800', marginBottom: 6 }}>
                {`#${i + 1}`}
              </Text>
              <TextInput
                value={v}
                onChangeText={(t) => update(i, t)}
                placeholder={
                  i === 0
                    ? 'A small kindness from someone…'
                    : i === 1
                    ? 'Something that tasted or felt good…'
                    : 'A little win you had…'
                }
                placeholderTextColor={c.iconMuted}
                multiline
                style={{
                  backgroundColor: c.surface,
                  borderRadius: Radii.md,
                  padding: 14,
                  fontSize: 15,
                  color: c.text,
                  borderWidth: 1,
                  borderColor: Borders.hairline[scheme],
                  minHeight: 60,
                }}
              />
            </View>
          ))}
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
          onPress={() => setDone(true)}
          disabled={filled === 0}
          style={({ pressed }) => ({
            flex: 1,
            paddingVertical: 14,
            borderRadius: Radii.md,
            backgroundColor: filled > 0 ? '#C97B6E' : c.iconMuted,
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>
            {filled === 0 ? 'Add at least one' : `Save (${filled})`}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
