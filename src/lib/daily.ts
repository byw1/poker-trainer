import type { Drill, Question } from "@/drills/types";

export const DAILY_COUNT = 10;

/** Deterministic 32-bit hash of a seed string. */
export function hashSeed(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** Small seeded PRNG — same seed always yields the same sequence. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Calendar date in America/Los_Angeles as YYYY-MM-DD. */
export function todayKey(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** The fixed set of daily questions for a seed string. */
export function dailyQuestions(drill: Drill, seedKey: string, count = DAILY_COUNT): Question[] {
  const rng = mulberry32(hashSeed(seedKey));
  const out: Question[] = [];
  for (let i = 0; i < count; i++) out.push(drill.generateQuestion(rng));
  return out;
}
