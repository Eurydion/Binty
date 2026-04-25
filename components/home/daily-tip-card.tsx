import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { DotPattern } from '@/components/effects/dot-pattern';
import { NoiseOverlay } from '@/components/effects/noise-overlay';
import { Borders, Colors, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/features/hooks/use-color-scheme';
import { TIP_CATEGORY_META } from '@/features/tips/catalog';
import { getDailyTip } from '@/features/tips/select';

export function DailyTipCard() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const router = useRouter();
  const tip = getDailyTip();
  const meta = TIP_CATEGORY_META[tip.category];

  return (
    <View style={{ paddingHorizontal: 24 }}>
      <Pressable
        onPress={() => router.push({ pathname: '/modals/tip-detail', params: { id: tip.id } })}
        style={({ pressed }) => ({
          borderRadius: Radii.lg,
          padding: Spacing.lg,
          borderWidth: 1,
          borderColor: Borders.hairline[scheme],
          backgroundColor: c.surface,
          overflow: 'hidden',
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        })}
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

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 9999,
              backgroundColor: meta.color + '24',
            }}
          >
            <Ionicons name={meta.icon as never} size={11} color={meta.color} />
            <Text
              style={{
                fontSize: 10,
                fontWeight: '800',
                letterSpacing: 0.7,
                color: meta.color,
                textTransform: 'uppercase',
              }}
            >
              {meta.label}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 10,
              fontWeight: '700',
              letterSpacing: 0.7,
              color: c.iconMuted,
              textTransform: 'uppercase',
            }}
          >
            Today’s Tip
          </Text>
          <View style={{ flex: 1 }} />
          <Ionicons name="chevron-forward" size={16} color={c.iconMuted} />
        </View>

        <Text
          style={{
            fontSize: 17,
            fontWeight: '800',
            color: c.text,
            marginBottom: 4,
          }}
        >
          {tip.title}
        </Text>
        <Text style={{ fontSize: 13, lineHeight: 19, color: c.iconMuted }}>
          {tip.preview}
        </Text>
      </Pressable>
    </View>
  );
}
