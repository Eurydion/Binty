import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Animated, {
    Easing,
    FadeIn,
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

import { Borders, Colors, Palette, Radii, Spacing } from '@/constants/theme';
import { getMascotComponent } from '@/features/mascot/mascot-map';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUserStore } from '@/store/use-user-store';
import type { Gender, IntensityPreference, WellnessGoal } from '@/types/user';

const GOAL_OPTIONS: { id: WellnessGoal; label: string; icon: 'leaf' | 'flame' | 'barbell' | 'moon' | 'heart' }[] = [
  { id: 'stress-reduction', label: 'Reduce stress', icon: 'leaf' },
  { id: 'better-sleep', label: 'Sleep better', icon: 'moon' },
  { id: 'weight-loss', label: 'Lose weight', icon: 'flame' },
  { id: 'muscle-gain', label: 'Build strength', icon: 'barbell' },
  { id: 'general-wellness', label: 'Stay well', icon: 'heart' },
];

const INTENSITY_OPTIONS: { id: IntensityPreference; label: string; sub: string }[] = [
  { id: 'light', label: 'Light', sub: 'Gentle, low pressure' },
  { id: 'moderate', label: 'Moderate', sub: 'Balanced challenge' },
  { id: 'intense', label: 'Intense', sub: "I want to push" },
];

type Step = 'welcome' | 'name' | 'basics' | 'goals' | 'intensity' | 'schedule' | 'done';

export default function OnboardingScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);

  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender | undefined>();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goals, setGoals] = useState<WellnessGoal[]>(['general-wellness']);
  const [intensity, setIntensity] = useState<IntensityPreference>('moderate');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [sleepTime, setSleepTime] = useState('22:00');

  const STEP_ORDER: Step[] = ['welcome', 'name', 'basics', 'goals', 'intensity', 'schedule', 'done'];
  const stepIdx = STEP_ORDER.indexOf(step);
  const progress = stepIdx / (STEP_ORDER.length - 1);

  const next = () => {
    const i = STEP_ORDER.indexOf(step);
    if (i < STEP_ORDER.length - 1) setStep(STEP_ORDER[i + 1]);
  };
  const back = () => {
    const i = STEP_ORDER.indexOf(step);
    if (i > 0) setStep(STEP_ORDER[i - 1]);
  };

  const finish = () => {
    completeOnboarding({
      name: name.trim() || 'Friend',
      age: age ? Number(age) : undefined,
      gender,
      weightKg: weight ? Number(weight) : undefined,
      heightCm: height ? Number(height) : undefined,
      goals: goals.length ? goals : ['general-wellness'],
      intensityPreference: intensity,
      wakeTime,
      sleepTime,
      dailyWaterGoalMl: weight ? Math.round(Number(weight) * 33) : 2500,
    });
    router.replace('/(tabs)');
  };

  const toggleGoal = (g: WellnessGoal) => {
    setGoals((cur) => (cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g]));
  };

  const canAdvance: boolean = (() => {
    if (step === 'name') return name.trim().length > 0;
    if (step === 'goals') return goals.length > 0;
    return true;
  })();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} >
      {/* Progress bar */}
      <View style={{ paddingHorizontal: Spacing.xl, paddingTop: Spacing.sm }}>
        <View
          style={{
            height: 4,
            borderRadius: Radii.pill,
            backgroundColor: Borders.hairline[scheme],
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: `${progress * 100}%`,
              height: '100%',
              backgroundColor: Palette.kangkong,
              borderRadius: Radii.pill,
            }}
          />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: Spacing.xl, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {step === 'welcome' && <WelcomeStep c={c} scheme={scheme} />}

        {step === 'name' && (
          <View style={{ marginTop: 24 }}>
            <Heading c={c} title="What should I call you?" sub="Your name stays on this device." />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={c.iconMuted}
              autoFocus
              style={inputStyle(c, scheme)}
            />
          </View>
        )}

        {step === 'basics' && (
          <View style={{ marginTop: 24 }}>
            <Heading c={c} title="A few basics" sub="All optional — used to personalize tips and water goals." />
            <Label c={c} text="Age" />
            <TextInput
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              placeholder="e.g. 25"
              placeholderTextColor={c.iconMuted}
              style={inputStyle(c, scheme)}
            />
            <Label c={c} text="Gender" />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['male', 'female'] as Gender[]).map((g) => (
                <Chip
                  key={g}
                  label={g === 'male' ? 'Male' : 'Female'}
                  selected={gender === g}
                  onPress={() => setGender(g)}
                  c={c}
                  scheme={scheme}
                />
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <View style={{ flex: 1 }}>
                <Label c={c} text="Weight (kg)" />
                <TextInput
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="decimal-pad"
                  placeholder="60"
                  placeholderTextColor={c.iconMuted}
                  style={inputStyle(c, scheme)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Label c={c} text="Height (cm)" />
                <TextInput
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="decimal-pad"
                  placeholder="165"
                  placeholderTextColor={c.iconMuted}
                  style={inputStyle(c, scheme)}
                />
              </View>
            </View>
          </View>
        )}

        {step === 'goals' && (
          <View style={{ marginTop: 24 }}>
            <Heading c={c} title="What matters to you?" sub="Pick one or more. We'll focus your routine here." />
            <View style={{ gap: 10 }}>
              {GOAL_OPTIONS.map((g) => {
                const sel = goals.includes(g.id);
                return (
                  <Pressable
                    key={g.id}
                    onPress={() => toggleGoal(g.id)}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 14,
                      padding: Spacing.md,
                      borderRadius: Radii.md,
                      backgroundColor: c.surface,
                      borderWidth: 1.5,
                      borderColor: sel ? Palette.kangkong : Borders.hairline[scheme],
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: Radii.pill,
                        backgroundColor: (sel ? Palette.kangkong : c.iconMuted) + '24',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons
                        name={`${g.icon}-outline` as any}
                        size={20}
                        color={sel ? Palette.kangkong : c.iconMuted}
                      />
                    </View>
                    <Text style={{ flex: 1, color: c.text, fontSize: 15, fontWeight: '700' }}>{g.label}</Text>
                    {sel && <Ionicons name="checkmark-circle" size={22} color={Palette.kangkong} />}
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {step === 'intensity' && (
          <View style={{ marginTop: 24 }}>
            <Heading c={c} title="Your pace" sub="How challenging should your routines feel?" />
            <View style={{ gap: 10 }}>
              {INTENSITY_OPTIONS.map((opt) => {
                const sel = intensity === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => setIntensity(opt.id)}
                    style={({ pressed }) => ({
                      padding: Spacing.md,
                      borderRadius: Radii.md,
                      backgroundColor: c.surface,
                      borderWidth: 1.5,
                      borderColor: sel ? Palette.kangkong : Borders.hairline[scheme],
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Text style={{ color: c.text, fontSize: 16, fontWeight: '800' }}>{opt.label}</Text>
                    <Text style={{ color: c.iconMuted, fontSize: 13, marginTop: 2 }}>{opt.sub}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {step === 'schedule' && (
          <View style={{ marginTop: 24 }}>
            <Heading c={c} title="Your day" sub="When do you usually wake up and sleep? (24h format)" />
            <Label c={c} text="Wake time" />
            <TextInput
              value={wakeTime}
              onChangeText={setWakeTime}
              placeholder="06:00"
              placeholderTextColor={c.iconMuted}
              style={inputStyle(c, scheme)}
            />
            <Label c={c} text="Sleep time" />
            <TextInput
              value={sleepTime}
              onChangeText={setSleepTime}
              placeholder="22:00"
              placeholderTextColor={c.iconMuted}
              style={inputStyle(c, scheme)}
            />
          </View>
        )}

        {step === 'done' && (
          <View style={{ marginTop: 60, alignItems: 'center' }}>
            <Text style={{ fontSize: 64 }}>🎉</Text>
            <Text style={{ color: c.text, fontSize: 26, fontWeight: '800', marginTop: 16, textAlign: 'center' }}>
              You&apos;re all set, {name || 'friend'}!
            </Text>
            <Text style={{ color: c.text, opacity: 0.7, fontSize: 15, marginTop: 12, textAlign: 'center', lineHeight: 22 }}>
              Binty will adapt to your routine, mood, and signals — gently. Let&apos;s start small.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
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
        {step !== 'welcome' && step !== 'done' && (
          <Pressable
            onPress={back}
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
            <Text style={{ color: c.text, fontWeight: '700' }}>Back</Text>
          </Pressable>
        )}
        <Pressable
          onPress={step === 'done' ? finish : next}
          disabled={!canAdvance}
          style={({ pressed }) => ({
            flex: 1,
            paddingVertical: 14,
            borderRadius: Radii.md,
            backgroundColor: canAdvance ? Palette.kangkong : c.iconMuted,
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>
            {step === 'welcome' ? 'Get started' : step === 'done' ? 'Enter Binty' : 'Continue'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function WelcomeStep({ c, scheme }: { c: any; scheme: 'light' | 'dark' }) {
  const MascotSvg = getMascotComponent('energized');
  const float = useSharedValue(0);

  useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
  }, [float]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: float.value }],
  }));

  return (
    <View style={{ marginTop: 40, alignItems: 'center' }}>
      {/* Mascot with glow ring */}
      <Animated.View entering={FadeIn.duration(600)} style={floatStyle}>
        <View
          style={{
            width: 160,
            height: 160,
            borderRadius: 9999,
            backgroundColor: Palette.kangkong + '12',
            borderWidth: 2,
            borderColor: Palette.kangkong + '28',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MascotSvg width={120} height={120} />
        </View>
      </Animated.View>

      {/* Title */}
      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={{ alignItems: 'center', marginTop: 28 }}>
        <Text
          style={{
            color: c.text,
            fontSize: 32,
            fontWeight: '800',
            textAlign: 'center',
            letterSpacing: -0.5,
          }}
        >
          Binty
        </Text>
        <Text
          style={{
            color: Palette.kangkong,
            fontSize: 13,
            fontWeight: '700',
            letterSpacing: 1.5,
            marginTop: 6,
            textAlign: 'center',
          }}
        >
          LESS GUESSING, MORE LIVING
        </Text>
      </Animated.View>

      {/* Divider dot */}
      <Animated.View entering={FadeInDown.delay(350).duration(400)}>
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: Palette.kangkong + '40',
            marginVertical: 20,
          }}
        />
      </Animated.View>

      {/* Description */}
      <Animated.View entering={FadeInDown.delay(450).duration(500)} style={{ paddingHorizontal: 8 }}>
        <Text
          style={{
            color: c.text,
            opacity: 0.7,
            fontSize: 15,
            textAlign: 'center',
            lineHeight: 24,
          }}
        >
          Your everyday wellness companion.{'\n'}Tiny habits, gentle nudges, and a calmer day —{'\n'}
          built for the realities of Filipino life.
        </Text>
      </Animated.View>

      {/* Subtle hint */}
      <Animated.View entering={FadeInDown.delay(600).duration(500)}>
        <Text style={{ color: c.iconMuted, fontSize: 12, marginTop: 36, textAlign: 'center' }}>
          We&apos;ll ask a few quick questions to personalize your experience.
        </Text>
      </Animated.View>
    </View>
  );
}

function Heading({ c, title, sub }: { c: any; title: string; sub: string }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ color: c.text, fontSize: 26, fontWeight: '800' }}>{title}</Text>
      <Text style={{ color: c.iconMuted, fontSize: 14, marginTop: 6, lineHeight: 20 }}>{sub}</Text>
    </View>
  );
}

function Label({ c, text }: { c: any; text: string }) {
  return (
    <Text style={{ color: c.iconMuted, fontSize: 11, fontWeight: '800', letterSpacing: 0.6, marginTop: 14, marginBottom: 6 }}>
      {text.toUpperCase()}
    </Text>
  );
}

function Chip({
  label,
  selected,
  onPress,
  c,
  scheme,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  c: any;
  scheme: 'light' | 'dark';
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: Radii.pill,
        backgroundColor: selected ? Palette.kangkong + '22' : c.surface,
        borderWidth: 1.5,
        borderColor: selected ? Palette.kangkong : Borders.hairline[scheme],
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text style={{ color: c.text, fontWeight: '700', fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

function inputStyle(c: any, scheme: 'light' | 'dark') {
  return {
    backgroundColor: c.surface,
    borderRadius: Radii.md,
    padding: 14,
    fontSize: 15,
    color: c.text,
    borderWidth: 1,
    borderColor: Borders.hairline[scheme],
  } as const;
}
