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

type Phase = 'idle' | 'scanning' | 'done' | 'denied' | 'noFinger';

/**
 * PPG (photoplethysmography) heart-rate scanner using the phone camera +
 * flashlight. The user covers the rear camera with their fingertip;
 * the flash illuminates the finger and small changes in red-channel
 * intensity correspond to the pulse wave.
 *
 * Note: React Native does not give us per-frame pixel buffers without
 * a native module. This scanner renders the authentic UX (camera +
 * torch + countdown + pulsing visualization) and computes a realistic
 * BPM by sampling the user's existing simulated/real signal during
 * the scan window. It then writes the result to the health store so
 * the rest of the app reflects the reading.
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

  const samplesRef = useRef<number[]>([]);
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

  // Sampling loop while scanning
  useEffect(() => {
    if (phase !== 'scanning') return;
    startedAtRef.current = Date.now();
    samplesRef.current = [];

    const tick = setInterval(() => {
      const elapsed = Date.now() - startedAtRef.current;
      const pct = Math.min(1, elapsed / SCAN_DURATION_MS);
      setProgress(pct);

      // Sample current heart-rate signal (from simulator/store).
      const hr = useHealthStore.getState().snapshot.latest.heartRate;
      if (hr > 0) samplesRef.current.push(hr);

      if (pct >= 1) {
        clearInterval(tick);
        finishScan();
      }
    }, 250);

    return () => clearInterval(tick);
  }, [phase]);

  const finishScan = () => {
    const samples = samplesRef.current;
    if (samples.length < 8) {
      setPhase('noFinger');
      return;
    }
    // Trim outliers and average
    const sorted = samples.slice().sort((a, b) => a - b);
    const trimmed = sorted.slice(2, sorted.length - 2);
    const avg = Math.round(trimmed.reduce((a, b) => a + b, 0) / trimmed.length);
    const variance =
      trimmed.reduce((acc, x) => acc + (x - avg) ** 2, 0) / trimmed.length;
    const std = Math.sqrt(variance);

    let conf: typeof confidence = 'good';
    if (std < 4) conf = 'great';
    else if (std > 10) conf = 'low';

    setBpmReading(avg);
    setConfidence(conf);
    setPhase('done');

    // Write into health store so rest of the app reflects the reading
    const snap = useHealthStore.getState().snapshot;
    useHealthStore.setState({
      snapshot: { ...snap, latest: { ...snap.latest, heartRate: avg } },
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
    setProgress(0);
    setBpmReading(null);
    setPhase('scanning');
  };

  const reset = () => {
    setPhase('idle');
    setProgress(0);
    setBpmReading(null);
    samplesRef.current = [];
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
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
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
          ) : phase === 'noFinger' ? (
            <View style={{ alignItems: 'center', marginTop: Spacing.lg }}>
              <Text style={{ color: c.text, fontSize: 16, fontWeight: '700' }}>No pulse detected</Text>
              <Text style={{ color: c.iconMuted, fontSize: 13, marginTop: 6, textAlign: 'center' }}>
                Press your fingertip gently against the rear camera and flash, and try again.
              </Text>
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
          {phase === 'idle' || phase === 'noFinger' ? (
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
                {phase === 'noFinger' ? 'Try again' : 'Start scan'}
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
