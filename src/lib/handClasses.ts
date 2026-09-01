export type Rank = "A" | "K" | "Q" | "J" | "T" | "9" | "8" | "7" | "6" | "5" | "4" | "3" | "2";
export type HandClass = string; // one of the 169

export const RANKS: Rank[] = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];

export function rankIndex(r: string): number {
  return RANKS.indexOf(r as Rank);
}

export function gridCell(row: number, col: number): HandClass {
  const hi = RANKS[Math.min(row, col)]!;
  const lo = RANKS[Math.max(row, col)]!;
  if (row === col) return hi + hi;
  return row < col ? `${hi}${lo}s` : `${hi}${lo}o`;
}

export function combos(h: HandClass): number {
  if (h.length === 2) return 6;
  return h.endsWith("s") ? 4 : 12;
}

export const ALL_HANDS: HandClass[] = (() => {
  const out: HandClass[] = [];
  for (let row = 0; row < 13; row++) {
    for (let col = 0; col < 13; col++) {
      out.push(gridCell(row, col));
    }
  }
  return out;
})();

export const TOTAL_COMBOS = ALL_HANDS.reduce((s, h) => s + combos(h), 0); // 1326

/** Picks a hand class weighted by combination count. */
export function randomHand(rng: () => number): HandClass {
  let n = rng() * TOTAL_COMBOS;
  for (const h of ALL_HANDS) {
    n -= combos(h);
    if (n <= 0) return h;
  }
  return ALL_HANDS[ALL_HANDS.length - 1]!;
}
