import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { DiagonalLines } from '@/components/effects/diagonal-lines';
import { NoiseOverlay } from '@/components/effects/noise-overlay';
import { Borders, Colors, Palette, Radii, Spacing } from '@/constants/theme';
import { getDailyQuote } from '@/features/quotes/quotes';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function QuoteCard() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const quote = getDailyQuote();

  return (
    <View style={{ paddingHorizontal: 24 }}>
      <View
        style={{
          borderRadius: Radii.lg,
          padding: Spacing.lg,
          borderWidth: 1,
          borderColor: Borders.hairline[scheme],
          backgroundColor: c.surface,
          overflow: 'hidden',
        }}
      >
        {/* soft tint layer */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: Palette.kangkong,
            opacity: scheme === 'dark' ? 0.18 : 0.08,
          }}
        />
        <DiagonalLines color={Palette.kangkong} opacity={0.14} spacing={16} />
        <NoiseOverlay opacity={0.04} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Ionicons name="sparkles" size={14} color={Palette.kangkong} />
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              letterSpacing: 0.8,
              color: Palette.kangkong,
            }}
          >
            DAILY QUOTE
          </Text>
        </View>
        <Text
          style={{
            fontSize: 16,
            lineHeight: 22,
            fontStyle: 'italic',
            color: c.text,
            marginBottom: 8,
          }}
        >
          “{quote.text}”
        </Text>
        <Text style={{ fontSize: 12, fontWeight: '600', color: c.iconMuted }}>
          — {quote.author}
        </Text>
      </View>
    </View>
  );
}
