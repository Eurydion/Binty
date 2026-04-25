import type { EmotionalState, HealthReading, HealthSnapshot, SleepData } from '@/types/health';
import { SCENARIOS, type Scenario } from '@/features/simulation/scenarios';

export type ConnectionState = 'disconnected' | 'connected' | 'paused';

export interface HistorySample {
  ts: number;
  bpm: number;
  stress: number;
  steps: number;
  hrv: number;
}

export interface SimulatorState {
  connection: ConnectionState;
  scenario: Scenario;
  snapshot: HealthSnapshot;
  history: HistorySample[];
}

const HISTORY_LIMIT = 60;
const TICK_MS = 5000;

let _interval: ReturnType<typeof setInterval> | null = null;
let _listeners: ((state: SimulatorState) => void)[] = [];
let _tickIndex = 0;

let _connection: ConnectionState = 'disconnected';
let _scenario: Scenario = 'resting';

let _hr = 72;
let _hrv = 50;
let _stress = 25;
let _spo2 = 98;
let _steps = 0;

let _history: HistorySample[] = [];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function rand(jitter: number): number {
  return (Math.random() * 2 - 1) * jitter;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function deriveState(hr: number, hrv: number, stress: number): EmotionalState {
  if (stress > 70 || hrv < 18) return 'stressed';
  if (hr > 105 && hrv < 28) return 'anxious';
  if (stress > 50) return 'sad';
  if (hr < 70 && hrv > 50) return 'energized';
  return 'calm';
}

function generateSleep(): SleepData {
  const duration = 420;
  return {
    date: new Date().toISOString().split('T')[0],
    durationMinutes: duration,
    quality: duration < 300 ? 'poor' : duration < 420 ? 'fair' : 'good',
    deepSleepMinutes: Math.round(duration * 0.2),
    remSleepMinutes: Math.round(duration * 0.25),
  };
}

function buildReading(): HealthReading {
  return {
    timestamp: Date.now(),
    heartRate: Math.round(_hr),
    hrv: Math.round(_hrv),
    steps: Math.round(_steps),
    spo2: Math.round(_spo2),
    stressLevel: Math.round(_stress),
  };
}

function buildSnapshot(): HealthSnapshot {
  const reading = buildReading();
  return {
    latest: reading,
    sleep: generateSleep(),
    detectedState: deriveState(reading.heartRate, reading.hrv, reading.stressLevel),
    source: 'simulated',
  };
}

export function getState(): SimulatorState {
  return {
    connection: _connection,
    scenario: _scenario,
    snapshot: buildSnapshot(),
    history: _history.slice(),
  };
}

function broadcast() {
  const state = getState();
  _listeners.forEach((cb) => cb(state));
}

function tick() {
  if (_connection !== 'connected') return;
  const preset = SCENARIOS[_scenario];
  const alpha = 0.35;

  // lerp toward target + jitter
  _hr = lerp(_hr, preset.hr.target, alpha) + rand(preset.hr.jitter);
  _hrv = lerp(_hrv, preset.hrv.target, alpha) + rand(preset.hrv.jitter);
  _stress = lerp(_stress, preset.stress.target, alpha) + rand(preset.stress.jitter);
  _spo2 = lerp(_spo2, preset.spo2.target, alpha) + rand(preset.spo2.jitter);
  _steps += preset.stepsPerTick;

  // optional drift override
  if (preset.drift) {
    const out = preset.drift({ hr: _hr, tickIndex: _tickIndex });
    if (typeof out.hr === 'number') _hr = out.hr;
  }

  _hr = clamp(_hr, 30, 220);
  _hrv = clamp(_hrv, 5, 120);
  _stress = clamp(_stress, 0, 100);
  _spo2 = clamp(_spo2, 80, 100);

  _history.push({
    ts: Date.now(),
    bpm: Math.round(_hr),
    stress: Math.round(_stress),
    steps: Math.round(_steps),
    hrv: Math.round(_hrv),
  });
  if (_history.length > HISTORY_LIMIT) _history = _history.slice(-HISTORY_LIMIT);

  _tickIndex += 1;
  broadcast();
}

function ensureInterval() {
  if (_interval) return;
  _interval = setInterval(tick, TICK_MS);
}

function clearTimer() {
  if (_interval) {
    clearInterval(_interval);
    _interval = null;
  }
}

export function connect() {
  _connection = 'connected';
  if (_history.length === 0) {
    _history.push({
      ts: Date.now(),
      bpm: Math.round(_hr),
      stress: Math.round(_stress),
      steps: Math.round(_steps),
      hrv: Math.round(_hrv),
    });
  }
  ensureInterval();
  broadcast();
}

export function pause() {
  if (_connection !== 'connected') return;
  _connection = 'paused';
  clearTimer();
  broadcast();
}

export function resume() {
  if (_connection !== 'paused') return;
  _connection = 'connected';
  ensureInterval();
  broadcast();
}

export function disconnect() {
  _connection = 'disconnected';
  clearTimer();
  _tickIndex = 0;
  _history = [];
  broadcast();
}

export function setScenario(scenario: Scenario) {
  _scenario = scenario;
  _tickIndex = 0;
  if (_connection === 'connected') {
    // emit one tick immediately so the UI reacts without waiting 5s
    tick();
  } else {
    broadcast();
  }
}

export function subscribe(cb: (state: SimulatorState) => void): () => void {
  _listeners.push(cb);
  cb(getState());
  return () => {
    _listeners = _listeners.filter((l) => l !== cb);
  };
}

export function getCurrentScenario(): Scenario {
  return _scenario;
}

export function getConnection(): ConnectionState {
  return _connection;
}
