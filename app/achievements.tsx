import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AchievementBadge } from '@/components/achievements/badge';
import { DotPattern } from '@/components/effects/dot-pattern';
import { NoiseOverlay } from '@/components/effects/noise-overlay';
import { Borders, Colors, Radii, Spacing } from '@/constants/theme';
import { ACHIEVEMENTS, TOTAL_POINTS } from '@/features/achievements/catalog';
import { RANKS, rankFor } from '@/features/achievements/ranks';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAchievementsStore } from '@/store/use-achievements-store';

export default function AchievementsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const byId = useAchievementsStore((s) => s.byId);
  const totalPointsFn = useAchievementsStore((s) => s.totalPoints);
  const total = ACHIEVEMENTS.length;
  const unlocked = Object.values(byId).filter((a) => a.unlockedAt != null).length;
  const points = totalPointsFn();
  const rp = rankFor(points);

  return (
    <>
      <Stack.Screen options={{ title: 'Achievements' }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} >
        <ScrollView contentContainerStyle={{ paddingVertical: 24, gap: 20 }}>
          {/* Hero — rank */}
          <View style={{ paddingHorizontal: 24 }}>
            <View
              style={{
                backgroundColor: rp.current.color,
                borderRadius: Radii.lg,
                padding: Spacing.xl,
                overflow: 'hidden',
              }}
            >
              <View style={{ position: 'absolute', inset: 0 }} pointerEvents="none">
                <DotPattern color="#FFFFFF" opacity={0.18} />
                <NoiseOverlay opacity={0.08} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 9999,
                    backgroundColor: '#FFFFFF22',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 32 }}>{rp.current.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '700',
                      color: '#FFFFFFCC',
                      letterSpacing: 0.6,
                    }}
                  >
                    YOUR RANK
                  </Text>
                  <Text
                    style={{
                      fontSize: 28,
                      fontWeight: '700',
                      color: '#FFFFFF',
                      marginTop: 2,
                    }}
                  >
                    {rp.current.label}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#FFFFFFCC', marginTop: 2 }}>
                    {points} / {TOTAL_POINTS} pts · {unlocked}/{total} unlocked
                  </Text>
                </View>
              </View>

              {/* progress to next */}
              <View style={{ marginTop: 16 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#FFFFFFCC' }}>
                    {rp.current.label.toUpperCase()}
                  </Text>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#FFFFFFCC' }}>
                    {rp.next ? rp.next.label.toUpperCase() : 'MAX'}
                  </Text>
                </View>
                <View
                  style={{
                    height: 8,
                    borderRadius: 9999,
                    backgroundColor: '#FFFFFF22',
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      width: `${rp.toNext * 100}%`,
                      height: '100%',
                      backgroundColor: '#FFFFFF',
                    }}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Rank ladder */}
          <View style={{ paddingHorizontal: 24 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: c.iconMuted,
                letterSpacing: 0.6,
                marginBottom: 8,
              }}
            >
              RANK LADDER
            </Text>
            <View
              style={{
                backgroundColor: c.surface,
                borderRadius: Radii.lg,
                padding: Spacing.md,
                borderWidth: 1,
                borderColor: Borders.hairline[scheme],
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              {RANKS.map((r) => {
                const reached = points >= r.minPoints;
                const isCurrent = rp.current.id === r.id;
                return (
                  <View key={r.id} style={{ alignItems: 'center', flex: 1 }}>
                    <View
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 9999,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: reached ? r.color : c.background,
                        borderWidth: isCurrent ? 2 : 0,
                        borderColor: '#FFFFFF',
                        opacity: reached ? 1 : 0.4,
                      }}
                    >
                      <Text style={{ fontSize: 14 }}>{r.icon}</Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 9,
                        fontWeight: '700',
                        color: isCurrent ? r.color : c.iconMuted,
                        marginTop: 4,
                        textAlign: 'center',
                      }}
                      numberOfLines={1}
                    >
                      {r.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Grid */}
          <View
            style={{
              paddingHorizontal: 24,
              flexDirection: 'row',
              flexWrap: 'wrap',
              rowGap: 20,
            }}
          >
            {ACHIEVEMENTS.map((a) => (
              <View key={a.id} style={{ width: '33.333%', alignItems: 'center' }}>
                <AchievementBadge achievement={a} unlocked={byId[a.id]?.unlockedAt != null} />
              </View>
            ))}
          </View>

          {/* Footer hint */}
          <View style={{ paddingHorizontal: 24 }}>
            <View
              style={{
                backgroundColor: c.surface,
                borderRadius: Radii.lg,
                padding: Spacing.lg,
                borderWidth: 1,
                borderColor: Borders.hairline[scheme],
                flexDirection: 'row',
                gap: 10,
              }}
            >
              <Ionicons name="sparkles" size={20} color={rp.current.color} />
              <Text style={{ fontSize: 13, color: c.iconMuted, flex: 1, lineHeight: 19 }}>
                Achievements unlock as you connect your watch, log routines, and explore healthy
                patterns. Climb the ranks from Noob all the way to Chad.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
