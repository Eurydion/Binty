import type { SleepNight, SleepSegment, SleepStage } from './types';

/**
 * Deterministic mock night generator. Builds 4ΓÇô5 realistic NREMΓåÆREM cycles
 * with brief Awake interruptions. Same `date` always returns the same shape
 * so the UI doesn't flicker across renders.
 */
function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86_400_000);
}

export function generateMockNight(date = new Date()): SleepNight {
  const rand = seededRand(dayOfYear(date) + 1);
  // bedtime Γëê 22:30 the previous evening (use today 22:30 for display purposes)
  const bedHour = 22 + Math.floor(rand() * 2); // 22 or 23
  const bedMin = Math.floor(rand() * 60);
  const start = new Date(date);
  start.setHours(bedHour, bedMin, 0, 0);
  start.setDate(start.getDate() - 1);

  let cursor = start.getTime();
  const segments: SleepSegment[] = [];

  // 4 cycles, ~90 minutes each, with stage progression
  const cycles = 4 + (rand() > 0.5 ? 1 : 0);
  for (let i = 0; i < cycles; i++) {
    const lightA = 18 + Math.floor(rand() * 12); // light
    const deep = (i < 2 ? 25 : 12) + Math.floor(rand() * 10); // more deep early
    const lightB = 12 + Math.floor(rand() * 8);
    const rem = (i < 2 ? 12 : 22) + Math.floor(rand() * 8); // more REM later
    const order: { stage: SleepStage; mins: number }[] = [
      { stage: 'light', mins: lightA },
      { stage: 'deep', mins: deep },
      { stage: 'light', mins: lightB },
      { stage: 'rem', mins: rem },
    ];
    for (const seg of order) {
      const endMs = cursor + seg.mins * 60_000;
      segments.push({ stage: seg.stage, startMs: cursor, endMs });
      cursor = endMs;
    }
    // small awake interruption between cycles
    if (i < cycles - 1 && rand() > 0.4) {
      const awakeMins = 2 + Math.floor(rand() * 4);
      const endMs = cursor + awakeMins * 60_000;
      segments.push({ stage: 'awake', startMs: cursor, endMs });
      cursor = endMs;
    }
  }

  const end = cursor;
  const summary = computeSummary(start.getTime(), end, segments);

  return {
    date: date.toISOString().split('T')[0],
    startMs: start.getTime(),
    endMs: end,
    segments,
    summary,
  };
}

function computeSummary(startMs: number, endMs: number, segments: SleepSegment[]) {
  const totals: Record<SleepStage, number> = { awake: 0, light: 0, deep: 0, rem: 0 };
  for (const s of segments) {
    totals[s.stage] += (s.endMs - s.startMs) / 60_000;
  }
  const durationMinutes = Math.round((endMs - startMs) / 60_000);
  const asleep = totals.light + totals.deep + totals.rem;
  const deepPct = asleep > 0 ? totals.deep / asleep : 0;
  const remPct = asleep > 0 ? totals.rem / asleep : 0;
  const efficiency = durationMinutes > 0 ? asleep / durationMinutes : 0;
  // weighted quality ΓÇö favors enough total + deep + rem proportions
  const qualityScore = Math.round(
    Math.min(
      100,
      Math.max(0, asleep / 4.8) * 0.5 + // up to 50 from total minutes (480m=full)
        deepPct * 100 * 0.25 +
        remPct * 100 * 0.15 +
        efficiency * 100 * 0.1,
    ),
  );
  const quality: 'poor' | 'fair' | 'good' =
    qualityScore >= 75 ? 'good' : qualityScore >= 50 ? 'fair' : 'poor';
  return {
    durationMinutes,
    awake: Math.round(totals.awake),
    light: Math.round(totals.light),
    deep: Math.round(totals.deep),
    rem: Math.round(totals.rem),
    quality,
    qualityScore,
  };
}
