import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Borders, Colors, Palette, Radii, Spacing } from '@/constants/theme';
import { detectFingerFromUri } from '@/features/ppg/finger-detector';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHealthStore } from '@/store/use-health-store';

const SCAN_DURATION_MS = 20_000;
const FINGER_POLL_MS = 600;

type Phase = 'idle' | 'waitingForFinger' | 'scanning' | 'done' | 'denied';

function pickBpm(): number {
  // Center-biased random in 62-92 (avg of two uniform rolls)
  const r1 = 62 + Math.random() * 30;
  const r2 = 62 + Math.random() * 30;
  return Math.round((r1 + r2) / 2);
}

/**
 * PPG (photoplethysmography) heart-rate scanner.
 *
 * Real finger detection (Expo Go compatible):
 *   - mounts a hidden expo-camera CameraView with the torch on
 *   - every ~600ms snapshots the lens, downsamples to 8x8 PNG, averages RGB,
 *     and decides if a finger is covering the camera (red-dominant + bright).
 *   - if finger is removed mid-scan, scanning pauses (progress + animation +
 *     haptics) and reverts to the "place your finger" prompt; resumes when
 *     the finger comes back.
 *
 * The BPM reading itself is simulated (stable random per scan window) so the
 * pitch demo always produces a plausible heart rate without requiring real
 * waveform analysis.
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
  // Progress accumulation across pauses (when finger lifts mid-scan)
  const accumulatedMsRef = useRef<number>(0);
  const segmentStartRef = useRef<number>(0);
  const pulse = useRef(new Animated.Value(1)).current;

  const cameraRef = useRef<CameraView | null>(null);
  const cameraReadyRef = useRef(false);
  const phaseRef = useRef<Phase>('idle');
  const checkInFlightRef = useRef(false);

  // Keep phaseRef in sync so the polling loop sees the current phase
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Camera should be mounted while we need finger detection or scanning.
  const cameraActive = phase === 'waitingForFinger' || phase === 'scanning';

  // Heartbeat-paced pulse animation + haptic during scanning
  useEffect(() => {
    if (phase !== 'scanning') return;
    const bpm = targetBpmRef.current ?? 75;
    const beatMs = Math.round(60_000 / bpm);

    let cancelled = false;

    const beat = async () => {
      if (cancelled) return;
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.22,
          duration: 110,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 220,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();

      try {
        const Haptics = await import('expo-haptics');
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // expo-haptics on Android may fall back to no-op; that's fine
      }
    };

    beat();
    const interval = setInterval(beat, beatMs);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [phase, pulse]);

  // Progress ticker — runs only while actively scanning
  useEffect(() => {
    if (phase !== 'scanning') return;
    segmentStartRef.current = Date.now();

    const tick = setInterval(() => {
      const elapsedThisSegment = Date.now() - segmentStartRef.current;
      const totalElapsed = accumulatedMsRef.current + elapsedThisSegment;
      const pct = Math.min(1, totalElapsed / SCAN_DURATION_MS);
      setProgress(pct);

      if (pct >= 1) {
        clearInterval(tick);
        finishScan();
      }
    }, 250);

    return () => {
      // Bank the elapsed time of this segment when we leave the scanning phase
      accumulatedMsRef.current += Date.now() - segmentStartRef.current;
      clearInterval(tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Finger-detection polling loop (runs whenever camera is active)
  useEffect(() => {
    if (!cameraActive) return;
    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      if (!cameraRef.current || !cameraReadyRef.current) return;
      if (checkInFlightRef.current) return;
      checkInFlightRef.current = true;
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0,
          base64: false,
          skipProcessing: true,
          exif: false,
          shutterSound: false,
        });
        if (cancelled || !photo?.uri) return;
        const sample = await detectFingerFromUri(photo.uri);
        if (cancelled || !sample) return;

        const currentPhase = phaseRef.current;
        if (sample.isFinger) {
          if (currentPhase === 'waitingForFinger') {
            setPhase('scanning');
          }
        } else {
          if (currentPhase === 'scanning') {
            setPhase('waitingForFinger');
          }
        }
      } catch (err) {
        // takePictureAsync can throw if camera isn't ready or torch is contested
        console.warn('[ppg] finger poll failed', err);
      } finally {
        checkInFlightRef.current = false;
      }
    };

    const interval = setInterval(poll, FINGER_POLL_MS);
    // Kick one off shortly after mount so the user gets fast feedback
    const kickoff = setTimeout(poll, 350);

    return () => {
      cancelled = true;
      clearInterval(interval);
      clearTimeout(kickoff);
    };
  }, [cameraActive]);

  const finishScan = useCallback(() => {
    const bpm = targetBpmRef.current ?? pickBpm();
    const conf: 'low' | 'good' | 'great' = Math.random() < 0.2 ? 'great' : 'good';

    setBpmReading(bpm);
    setConfidence(conf);
    setPhase('done');

    const snap = useHealthStore.getState().snapshot;
    useHealthStore.setState({
      snapshot: { ...snap, latest: { ...snap.latest, heartRate: bpm } },
    });
  }, []);

  const startScan = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        setPhase('denied');
        return;
      }
    }
    targetBpmRef.current = pickBpm();
    accumulatedMsRef.current = 0;
    cameraReadyRef.current = false;
    setProgress(0);
    setBpmReading(null);
    setPhase('waitingForFinger');
  };

  const reset = () => {
    setPhase('idle');
    setProgress(0);
    setBpmReading(null);
    targetBpmRef.current = null;
    accumulatedMsRef.current = 0;
    cameraReadyRef.current = false;
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

  const remainingS = Math.max(
    0,
    Math.ceil(((1 - progress) * SCAN_DURATION_MS) / 1000),
  );

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
                phase === 'scanning'
                  ? Palette.kamote
                  : phase === 'waitingForFinger'
                  ? Palette.silverBlue
                  : Borders.hairline[scheme],
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#000',
            }}
          >
            {cameraActive && permission?.granted ? (
              <CameraView
                ref={(ref) => {
                  cameraRef.current = ref;
                }}
                facing="back"
                enableTorch
                onCameraReady={() => {
                  cameraReadyRef.current = true;
                }}
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
                Reading your pulse — keep finger steady
              </Text>
              <Text style={{ color: c.iconMuted, fontSize: 13, marginTop: 6 }}>
                Hold steady — {remainingS}s remaining
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
          ) : phase === 'waitingForFinger' ? (
            <View style={{ alignItems: 'center', marginTop: Spacing.lg }}>
              <Text style={{ color: c.text, fontSize: 16, fontWeight: '700', textAlign: 'center' }}>
                Place your fingertip over the rear camera + flash
              </Text>
              <Text style={{ color: c.iconMuted, fontSize: 13, marginTop: 6, textAlign: 'center', lineHeight: 18 }}>
                We&apos;ll start reading the moment we see your finger.{'\n'}
                Press gently and hold still.
              </Text>
              {progress > 0 ? (
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
                      backgroundColor: Palette.silverBlue,
                      borderRadius: Radii.pill,
                    }}
                  />
                </View>
              ) : null}
            </View>
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
                The flashlight will turn on. Stay still until we&apos;ve gathered{'\n'}
                {Math.round(SCAN_DURATION_MS / 1000)} seconds of finger contact.
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
