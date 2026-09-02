/** XP, ranks, and badges — all local, no backend. */

export const XP_CORRECT = 10;
export const XP_INCORRECT = 3;
export const XP_DAILY_BONUS = 20;

export interface Rank {
  name: string;
  min: number;
}

export const RANKS: Rank[] = [
  { name: "Fish", min: 0 },
  { name: "Student", min: 100 },
  { name: "Regular", min: 300 },
  { name: "Nit-crusher", min: 800 },
  { name: "GTO", min: 2000 },
  { name: "Solver", min: 5000 },
];

export function rankFor(xp: number): { rank: Rank; next: Rank | null; progress: number } {
  let i = 0;
  for (let k = 0; k < RANKS.length; k++) if (xp >= RANKS[k]!.min) i = k;
  const rank = RANKS[i]!;
  const next = RANKS[i + 1] ?? null;
  const progress = next ? (xp - rank.min) / (next.min - rank.min) : 1;
  return { rank, next, progress };
}

export type BadgeId =
  | "first-correct"
  | "daily-10"
  | "streak-5"
  | "streak-20"
  | "never-limp"
  | "seat-specialist";

export const BADGES: Record<BadgeId, { label: string; hint: string }> = {
  "first-correct": { label: "First correct", hint: "Your first chart-matching decision." },
  "daily-10": { label: "Today's 10", hint: "Finished a daily challenge." },
  "streak-5": { label: "Streak 5", hint: "Five correct in a row." },
  "streak-20": { label: "Streak 20", hint: "Twenty correct in a row." },
  "never-limp": { label: "Never limp", hint: "20 hands in a row without limping." },
  "seat-specialist": {
    label: "Seat specialist",
    hint: "20 hands from one seat at 80% or better.",
  },
};
