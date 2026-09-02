import type { HandClass } from "./handClasses";
import { POSITIONS, type Position } from "./charts";
import {
  XP_CORRECT,
  XP_INCORRECT,
  XP_DAILY_BONUS,
  type BadgeId,
} from "./progress";

const KEY = "poker-trainer";

export interface Stats {
  version: 3;
  totalAnswered: number;
  totalCorrect: number;
  currentStreak: number;
  bestStreak: number;
  byPosition: Record<Position, { answered: number; correct: number }>;
  byHand: Record<HandClass, { answered: number; correct: number }>;
  /** YYYY-MM-DD → best daily challenge score that day. */
  dailyBest: Record<string, number>;
  /** Experience points: +10 correct, +3 incorrect, +20 for finishing a daily. */
  xp: number;
  /** Badges unlocked once, in unlock order. */
  badges: BadgeId[];
  /** Hands answered in a row without limping. */
  noLimpStreak: number;
}

export function freshStats(): Stats {
  const byPosition = {} as Stats["byPosition"];
  for (const p of POSITIONS) byPosition[p] = { answered: 0, correct: 0 };
  return {
    version: 3,
    totalAnswered: 0,
    totalCorrect: 0,
    currentStreak: 0,
    bestStreak: 0,
    byPosition,
    byHand: {},
    dailyBest: {},
    xp: 0,
    badges: [],
    noLimpStreak: 0,
  };
}

export function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return freshStats();
    const parsed = JSON.parse(raw) as (Partial<Omit<Stats, "version">> & { version?: number }) | null;
    // v1 had no dailyBest; keep the history and add it. Anything else is unknown.
    if (!parsed || ![1, 2, 3].includes(parsed.version ?? 0)) return freshStats();
    const base = freshStats();
    return {
      ...base,
      ...parsed,
      version: 3,
      xp: parsed.xp ?? 0,
      badges: [...(parsed.badges ?? [])],
      noLimpStreak: parsed.noLimpStreak ?? 0,
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
  const dailyBest = score > prev ? { ...stats.dailyBest, [dateKey]: score } : stats.dailyBest;
  const next = unlock(
    { ...stats, dailyBest, xp: stats.xp + XP_DAILY_BONUS },
    ["daily-10"],
  );
  saveStats(next);
  return next;
}

/** Adds badges that are not unlocked yet, keeping unlock order. */
function unlock(stats: Stats, ids: BadgeId[]): Stats {
  const add = ids.filter((id) => !stats.badges.includes(id));
  if (add.length === 0) return stats;
  return { ...stats, badges: [...stats.badges, ...add] };
}

export function recordAnswer(
  stats: Stats,
  position: Position,
  hand: HandClass,
  correct: boolean,
  action: "fold" | "call" | "raise" = "fold",
): Stats {
  const pos = stats.byPosition[position] ?? { answered: 0, correct: 0 };
  const h = stats.byHand[hand] ?? { answered: 0, correct: 0 };
  const currentStreak = correct ? stats.currentStreak + 1 : 0;
  const noLimpStreak = action === "call" ? 0 : stats.noLimpStreak + 1;
  let next: Stats = {
    ...stats,
    xp: stats.xp + (correct ? XP_CORRECT : XP_INCORRECT),
    noLimpStreak,
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

  const earned: BadgeId[] = [];
  if (next.totalCorrect >= 1) earned.push("first-correct");
  if (next.currentStreak >= 5) earned.push("streak-5");
  if (next.currentStreak >= 20) earned.push("streak-20");
  if (noLimpStreak >= 20) earned.push("never-limp");
  if (
    Object.values(next.byPosition).some((v) => v.answered >= 20 && v.correct / v.answered >= 0.8)
  ) {
    earned.push("seat-specialist");
  }
  next = unlock(next, earned);

  saveStats(next);
  return next;
}
