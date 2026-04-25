import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Borders, Colors, Palette, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHealthStore } from '@/store/use-health-store';

const SCAN_DURATION_MS = 20_000;

type Phase = 'idle' | 'scanning' | 'done' | 'denied';

function pickBpm(): number {
  // Center-biased random in 62-92 (avg of two uniform rolls)
  const r1 = 62 + Math.random() * 30;
  const r2 = 62 + Math.random() * 30;
  return Math.round((r1 + r2) / 2);
}

/**
 * PPG (photoplethysmography) heart-rate scanner — simulated.
 * Uses the rear camera + flashlight as authentic UI scaffolding.
 * On scan start we roll a single target BPM and keep it stable for
 * the entire scan window, then write it to the health store.
 */
export default function PPGScannerScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [bpmReading, setBpmReading] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<'low' | 'good' | 'great'>('good');

  const targetBpmRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const pulse = useRef(new Animated.Value(1)).current;

  // Pulse animation while scanning
  useEffect(() => {
    if (phase !== 'scanning') return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.18,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [phase, pulse]);

  // Progress ticker while scanning
  useEffect(() => {
    if (phase !== 'scanning') return;
    startedAtRef.current = Date.now();

    const tick = setInterval(() => {
      const elapsed = Date.now() - startedAtRef.current;
      const pct = Math.min(1, elapsed / SCAN_DURATION_MS);
      setProgress(pct);

      if (pct >= 1) {
        clearInterval(tick);
        finishScan();
      }
    }, 250);

    return () => clearInterval(tick);
  }, [phase]);

  const finishScan = () => {
    const bpm = targetBpmRef.current ?? pickBpm();
    // ~20% of the time award "great" confidence for variety
    const conf: typeof confidence = Math.random() < 0.2 ? 'great' : 'good';

    setBpmReading(bpm);
    setConfidence(conf);
    setPhase('done');

    // Write into health store so rest of the app reflects the reading
    const snap = useHealthStore.getState().snapshot;
    useHealthStore.setState({
      snapshot: { ...snap, latest: { ...snap.latest, heartRate: bpm } },
    });
  };

  const startScan = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        setPhase('denied');
        return;
      }
    }
    targetBpmRef.current = pickBpm();
    setProgress(0);
    setBpmReading(null);
    setPhase('scanning');
  };

  const reset = () => {
    setPhase('idle');
    setProgress(0);
    setBpmReading(null);
    targetBpmRef.current = null;
  };

  if (phase === 'denied' || (permission && !permission.granted && phase === 'idle')) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} >
        <View style={{ flex: 1, padding: Spacing.xl, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="videocam-off-outline" size={48} color={c.iconMuted} />
          <Text style={{ color: c.text, fontSize: 22, fontWeight: '800', marginTop: 16, textAlign: 'center' }}>
            Camera access needed
          </Text>
          <Text style={{ color: c.iconMuted, fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
            We use the rear camera + flashlight to read your pulse.
            No images are stored or sent anywhere.
          </Text>
          <Pressable
            onPress={requestPermission}
            style={({ pressed }) => ({
              backgroundColor: Palette.kangkong,
              borderRadius: Radii.md,
              paddingVertical: 14,
              paddingHorizontal: 28,
              marginTop: Spacing.xl,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ color: '#fff', fontWeight: '800' }}>Grant access</Text>
          </Pressable>
          <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
            <Text style={{ color: c.iconMuted }}>Cancel</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
      <View style={{ flex: 1, padding: Spacing.xl, justifyContent: 'space-between' }}>
        <View>
          <Text style={{ color: c.iconMuted, fontSize: 11, fontWeight: '800', letterSpacing: 0.7 }}>
            CAMERA-BASED PPG
          </Text>
          <Text style={{ color: c.text, fontSize: 26, fontWeight: '800', marginTop: 4 }}>
            Phone heart-rate scan
          </Text>
        </View>

        <View style={{ alignItems: 'center' }}>
          <View
            style={{
              width: 220,
              height: 220,
              borderRadius: 9999,
              overflow: 'hidden',
              borderWidth: 3,
              borderColor:
                phase === 'scanning' ? Palette.kamote : Borders.hairline[scheme],
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#000',
            }}
          >
            {phase === 'scanning' && permission?.granted ? (
              <CameraView
                facing="back"
                enableTorch
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <Ionicons
                name={phase === 'done' ? 'heart' : 'finger-print'}
                size={72}
                color={phase === 'done' ? Palette.kamote : c.iconMuted}
              />
            )}
            {phase === 'scanning' ? (
              <Animated.View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  width: 80,
                  height: 80,
                  borderRadius: 9999,
                  backgroundColor: Palette.kamote + '55',
                  transform: [{ scale: pulse }],
                }}
              />
            ) : null}
          </View>

          {phase === 'scanning' ? (
            <>
              <Text style={{ color: c.text, fontSize: 16, fontWeight: '700', marginTop: Spacing.lg }}>
                Cover the rear camera + flash with your fingertip
              </Text>
              <Text style={{ color: c.iconMuted, fontSize: 13, marginTop: 6 }}>
                Hold steady — {Math.max(0, Math.ceil((1 - progress) * (SCAN_DURATION_MS / 1000)))}s
                remaining
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
            </>
          ) : phase === 'done' && bpmReading != null ? (
            <View style={{ alignItems: 'center', marginTop: Spacing.lg }}>
              <Text style={{ color: c.iconMuted, fontSize: 12, fontWeight: '800', letterSpacing: 0.6 }}>
                YOUR PULSE
              </Text>
              <Text style={{ color: c.text, fontSize: 64, fontWeight: '800', marginTop: 4 }}>
                {bpmReading}
              </Text>
              <Text style={{ color: c.iconMuted, fontSize: 14 }}>BPM</Text>
              <View
                style={{
                  marginTop: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: Radii.pill,
                  backgroundColor:
                    confidence === 'great'
                      ? Palette.kangkong + '22'
                      : confidence === 'good'
                      ? Palette.silverBlue + '22'
                      : Palette.kamote + '22',
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '800',
                    color:
                      confidence === 'great'
                        ? Palette.kangkong
                        : confidence === 'good'
                        ? Palette.silverBlue
                        : Palette.kamote,
                  }}
                >
                  {confidence === 'great'
                    ? 'High confidence'
                    : confidence === 'good'
                    ? 'Good signal'
                    : 'Low signal — try again'}
                </Text>
              </View>
            </View>
          ) : (
            <View style={{ alignItems: 'center', marginTop: Spacing.lg }}>
              <Text style={{ color: c.text, fontSize: 16, fontWeight: '700', textAlign: 'center' }}>
                Place your fingertip over the rear camera
              </Text>
              <Text style={{ color: c.iconMuted, fontSize: 13, marginTop: 6, textAlign: 'center', lineHeight: 18 }}>
                The flashlight will turn on. Stay still for 20 seconds.{'\n'}
                We&apos;ll detect your heartbeat from light changes.
              </Text>
            </View>
          )}
        </View>

        <View style={{ gap: 10 }}>
          {phase === 'idle' ? (
            <Pressable
              onPress={startScan}
              style={({ pressed }) => ({
                backgroundColor: Palette.kamote,
                borderRadius: Radii.md,
                paddingVertical: 16,
                alignItems: 'center',
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>
                Start scan
              </Text>
            </Pressable>
          ) : phase === 'done' ? (
            <>
              <Pressable
                onPress={reset}
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
                <Text style={{ color: c.text, fontWeight: '700', fontSize: 14 }}>Scan again</Text>
              </Pressable>
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => ({
                  backgroundColor: Palette.kangkong,
                  borderRadius: Radii.md,
                  paddingVertical: 16,
                  alignItems: 'center',
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Save reading</Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              onPress={reset}
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
              <Text style={{ color: c.text, fontWeight: '700', fontSize: 14 }}>Cancel scan</Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
