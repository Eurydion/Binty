import { Platform, Vibration } from 'react-native';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

// Repeating vibration pattern: 0ms wait, 500ms vibrate, 400ms pause
const VIBRATION_PATTERN = [0, 500, 400];

let player: AudioPlayer | null = null;
let alarmActive = false;
let audioModeReady = false;

function getPlayer(): AudioPlayer | null {
  if (Platform.OS === 'web') return null;
  if (player) return player;
  try {
    player = createAudioPlayer(require('@/assets/sounds/alarm.wav'));
    try {
      (player as any).loop = true;
    } catch (err) {
      console.warn('[urgentAlert] failed to set loop on player', err);
    }
    return player;
  } catch (err) {
    console.warn('[urgentAlert] createAudioPlayer failed', err);
    return null;
  }
}

async function ensureAudioMode(): Promise<void> {
  if (audioModeReady) return;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers',
    });
    audioModeReady = true;
  } catch (err) {
    console.warn('[urgentAlert] setAudioModeAsync failed', err);
  }
}

/**
 * Starts a LOOPING urgent alert: alarm sound + repeating vibration.
 * Keeps going until `stopUrgentAlert()` is called (typically when the
 * user taps any action on the check-in modal).
 *
 * Calling twice without stopping is a no-op.
 */
export async function startUrgentAlert(): Promise<void> {
  if (alarmActive) return;
  alarmActive = true;

  // Repeating vibration (second arg = true loops the pattern)
  try {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(VIBRATION_PATTERN, true);
    }
  } catch (err) {
    console.warn('[urgentAlert] vibration failed', err);
  }

  // Initial haptic warning tap (sharper than vibration alone)
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (err) {
    console.warn('[urgentAlert] haptic failed', err);
  }

  // Looping alarm sound
  if (Platform.OS === 'web') return;
  await ensureAudioMode();
  if (!alarmActive) return; // user stopped while we were awaiting
  const p = getPlayer();
  if (!p) return;
  try {
    // Make sure loop is on (in case player was used previously)
    try {
      (p as any).loop = true;
    } catch {
      // ignore
    }
    // Rewind to start so a fresh trigger always plays from the beginning
    try {
      (p as any).seekTo?.(0);
    } catch {
      // ignore
    }
    p.play();
  } catch (err) {
    console.warn('[urgentAlert] player.play failed', err);
  }
}

/**
 * Stops the urgent alert (sound + vibration). Safe to call multiple
 * times or when no alert is active.
 */
export function stopUrgentAlert(): void {
  alarmActive = false;
  try {
    if (Platform.OS !== 'web') {
      Vibration.cancel();
    }
  } catch (err) {
    console.warn('[urgentAlert] Vibration.cancel failed', err);
  }
  if (player) {
    try {
      player.pause();
    } catch (err) {
      console.warn('[urgentAlert] player.pause failed', err);
    }
    try {
      (player as any).seekTo?.(0);
    } catch {
      // ignore
    }
    // Keep the player instance around so we don't pay the load cost again.
  }
}
