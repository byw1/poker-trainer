import type { HandClass } from "./handClasses";
import { POSITIONS, type Position } from "./charts";

const KEY = "poker-trainer";

export interface Stats {
  version: 2;
  totalAnswered: number;
  totalCorrect: number;
  currentStreak: number;
  bestStreak: number;
  byPosition: Record<Position, { answered: number; correct: number }>;
  byHand: Record<HandClass, { answered: number; correct: number }>;
  /** YYYY-MM-DD → best daily challenge score that day. */
  dailyBest: Record<string, number>;
}

export function freshStats(): Stats {
  const byPosition = {} as Stats["byPosition"];
  for (const p of POSITIONS) byPosition[p] = { answered: 0, correct: 0 };
  return {
    version: 2,
    totalAnswered: 0,
    totalCorrect: 0,
    currentStreak: 0,
    bestStreak: 0,
    byPosition,
    byHand: {},
    dailyBest: {},
  };
}

export function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return freshStats();
    const parsed = JSON.parse(raw) as (Partial<Omit<Stats, "version">> & { version?: number }) | null;
    // v1 had no dailyBest; keep the history and add it. Anything else is unknown.
    if (!parsed || (parsed.version !== 1 && parsed.version !== 2)) return freshStats();
    const base = freshStats();
    return {
      ...base,
      ...parsed,
      version: 2,
      byPosition: { ...base.byPosition, ...(parsed.byPosition ?? {}) },
      byHand: { ...(parsed.byHand ?? {}) },
      dailyBest: { ...(parsed.dailyBest ?? {}) },
    };
  } catch {
    return freshStats();
  }
}

export function saveStats(stats: Stats): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(stats));
  } catch {
    /* storage unavailable — stats stay in memory only */
  }
}

/** Records a finished daily challenge, keeping the best score for that date. */
export function recordDaily(stats: Stats, dateKey: string, score: number): Stats {
  const prev = stats.dailyBest[dateKey] ?? -1;
  if (score <= prev) return stats;
  const next: Stats = { ...stats, dailyBest: { ...stats.dailyBest, [dateKey]: score } };
  saveStats(next);
  return next;
}

export function recordAnswer(
  stats: Stats,
  position: Position,
  hand: HandClass,
  correct: boolean,
): Stats {
  const pos = stats.byPosition[position] ?? { answered: 0, correct: 0 };
  const h = stats.byHand[hand] ?? { answered: 0, correct: 0 };
  const currentStreak = correct ? stats.currentStreak + 1 : 0;
  const next: Stats = {
    ...stats,
    totalAnswered: stats.totalAnswered + 1,
    totalCorrect: stats.totalCorrect + (correct ? 1 : 0),
    currentStreak,
    bestStreak: Math.max(stats.bestStreak, currentStreak),
    byPosition: {
      ...stats.byPosition,
      [position]: { answered: pos.answered + 1, correct: pos.correct + (correct ? 1 : 0) },
    },
    byHand: {
      ...stats.byHand,
      [hand]: { answered: h.answered + 1, correct: h.correct + (correct ? 1 : 0) },
    },
  };
  saveStats(next);
  return next;
}
