import type { EmotionalState, HealthReading, HealthSnapshot, SleepData } from '@/types/health';

let _interval: ReturnType<typeof setInterval> | null = null;
let _listeners: ((snapshot: HealthSnapshot) => void)[] = [];

const DEFAULT_BPM = 72;
let _currentBpm = DEFAULT_BPM;
let _currentHrv = 50;
let _currentSpo2 = 98;
let _currentSteps = 0;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function deriveState(hr: number, hrv: number, stress: number): EmotionalState {
  if (stress > 70 || hrv < 15) return 'stressed';
  if (hr > 100 && hrv < 25) return 'anxious';
  if (stress > 50) return 'sad';
  if (hr < 70 && hrv > 50) return 'energized';
  return 'calm';
}

function computeStress(hr: number, hrv: number): number {
  return Math.round(clamp((100 - hrv) * 0.7 + (hr - 60) * 0.3, 0, 100));
}

export function generateReading(): HealthReading {
  const stressLevel = computeStress(_currentBpm, _currentHrv);
  return {
    timestamp: Date.now(),
    heartRate: _currentBpm,
    hrv: _currentHrv,
    steps: _currentSteps,
    spo2: _currentSpo2,
    stressLevel,
  };
}

export function generateSleep(): SleepData {
  const duration = 420;
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

export function getCurrentBpm(): number {
  return _currentBpm;
}

function broadcast(): HealthSnapshot {
  const snapshot = getSnapshot();
  _listeners.forEach((cb) => cb(snapshot));
  return snapshot;
}

export function setManualBpm(bpm: number): HealthSnapshot {
  _currentBpm = clamp(Math.round(bpm), 30, 220);
  return broadcast();
}

export function adjustBpm(delta: number): HealthSnapshot {
  return setManualBpm(_currentBpm + delta);
}

export function startSimulator(onUpdate: (snapshot: HealthSnapshot) => void, _intervalMs = 30000): void {
  if (!_listeners.includes(onUpdate)) {
    _listeners.push(onUpdate);
  }
  onUpdate(getSnapshot());
}

export function stopSimulator(): void {
  if (_interval) {
    clearInterval(_interval);
    _interval = null;
  }
  _listeners = [];
}
