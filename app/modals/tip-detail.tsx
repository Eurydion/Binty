import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DotPattern } from '@/components/effects/dot-pattern';
import { NoiseOverlay } from '@/components/effects/noise-overlay';
import { Borders, Colors, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/features/hooks/use-color-scheme';
import { TIP_CATEGORY_META, TIPS_BY_ID } from '@/features/tips/catalog';
import { getDailyTip } from '@/features/tips/select';
import { useTipsStore } from '@/store/use-tips-store';

export default function TipDetailModal() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const params = useLocalSearchParams<{ id?: string }>();
  const tip = (params.id && TIPS_BY_ID[params.id]) || getDailyTip();
  const meta = TIP_CATEGORY_META[tip.category];

  const isSaved = useTipsStore((s) => s.savedIds.includes(tip.id));
  const toggleSave = useTipsStore((s) => s.toggleSave);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
        <View
          style={{
            borderRadius: Radii.lg,
            padding: Spacing.xl,
            borderWidth: 1,
            borderColor: Borders.hairline[scheme],
            backgroundColor: c.surface,
            overflow: 'hidden',
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: meta.color,
              opacity: scheme === 'dark' ? 0.16 : 0.08,
            }}
          />
          <DotPattern color={meta.color} opacity={0.18} spacing={14} />
          <NoiseOverlay opacity={0.04} />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 9999,
                backgroundColor: meta.color + '24',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name={meta.icon as never} size={22} color={meta.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '800',
                  letterSpacing: 0.8,
                  color: meta.color,
                  textTransform: 'uppercase',
                }}
              >
                {meta.label}
              </Text>
              <Text style={{ fontSize: 11, color: c.iconMuted, marginTop: 2 }}>
                Daily wellness tip
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 22, fontWeight: '800', color: c.text, marginBottom: 8 }}>
            {tip.title}
          </Text>
          <Text style={{ fontSize: 15, fontWeight: '600', color: c.text, marginBottom: 12 }}>
            {tip.preview}
          </Text>
          <Text style={{ fontSize: 14, lineHeight: 22, color: c.iconMuted }}>{tip.body}</Text>
        </View>

        <Pressable
          onPress={() => toggleSave(tip.id)}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 14,
            borderRadius: Radii.md,
            backgroundColor: isSaved ? meta.color : c.surface,
            borderWidth: 1,
            borderColor: isSaved ? meta.color : Borders.hairline[scheme],
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={isSaved ? '#fff' : c.text}
          />
          <Text
            style={{
              fontSize: 14,
              fontWeight: '700',
              color: isSaved ? '#fff' : c.text,
            }}
          >
            {isSaved ? 'Saved' : 'Save for later'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
