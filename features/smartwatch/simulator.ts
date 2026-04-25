import type { EmotionalState, HealthReading, HealthSnapshot, SleepData } from '@/types/health';

let _interval: ReturnType<typeof setInterval> | null = null;
let _listeners: ((snapshot: HealthSnapshot) => void)[] = [];

function randomBetween(min: number, max: number): number {
  return Math.round(Math.random() * (max - min) + min);
}

function deriveState(hr: number, hrv: number, stress: number): EmotionalState {
  if (stress > 70 || hrv < 15) return 'stressed';
  if (hr > 100 && hrv < 25) return 'anxious';
  if (stress > 50) return 'sad';
  if (hr < 70 && hrv > 50) return 'energized';
  return 'calm';
}

export function generateReading(): HealthReading {
  const heartRate = randomBetween(58, 115);
  const hrv = randomBetween(10, 80);
  const stressLevel = Math.round(Math.max(0, Math.min(100, (100 - hrv) * 0.7 + (heartRate - 60) * 0.3)));

  return {
    timestamp: Date.now(),
    heartRate,
    hrv,
    steps: randomBetween(0, 15000),
    spo2: randomBetween(94, 100),
    stressLevel,
  };
}

export function generateSleep(): SleepData {
  const duration = randomBetween(240, 540);
  return {
    date: new Date().toISOString().split('T')[0],
    durationMinutes: duration,
    quality: duration < 300 ? 'poor' : duration < 420 ? 'fair' : 'good',
    deepSleepMinutes: Math.round(duration * 0.2),
    remSleepMinutes: Math.round(duration * 0.25),
  };
}

export function getSnapshot(): HealthSnapshot {
  const reading = generateReading();
  const sleep = generateSleep();
  return {
    latest: reading,
    sleep,
    detectedState: deriveState(reading.heartRate, reading.hrv, reading.stressLevel),
    source: 'simulated',
  };
}

export function startSimulator(onUpdate: (snapshot: HealthSnapshot) => void, intervalMs = 30000): void {
  _listeners.push(onUpdate);
  if (_interval) return;
  _interval = setInterval(() => {
    const snapshot = getSnapshot();
    _listeners.forEach((cb) => cb(snapshot));
  }, intervalMs);
}

export function stopSimulator(): void {
  if (_interval) {
    clearInterval(_interval);
    _interval = null;
  }
  _listeners = [];
}
