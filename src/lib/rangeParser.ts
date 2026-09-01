import { ALL_HANDS, RANKS, combos, rankIndex, TOTAL_COMBOS, type HandClass } from "./handClasses";

export type Range = Record<HandClass, number>; // 0 to 1 — raise frequency

export function emptyRange(): Range {
  const r: Range = {};
  for (const h of ALL_HANDS) r[h] = 0;
  return r;
}

/**
 * Expands chart shorthand into a full 169-key range.
 * Supported tokens: "77+", "22+", "AKs", "A9s+", "AQo+", "T9s", "54s".
 * "+" on a pair means that pair and every higher pair.
 * "+" on a non-pair means that hand and every hand with the same high card
 * and a higher kicker (e.g. "K7s+" = K7s..KQs).
 */
export function parseRange(shorthand: string[]): Range {
  const range = emptyRange();
  const set = (h: HandClass) => {
    if (!(h in range)) throw new Error(`Unknown hand class: ${h}`);
    range[h] = 1;
  };

  for (const raw of shorthand) {
    const token = raw.trim();
    if (!token) continue;
    const plus = token.endsWith("+");
    const body = plus ? token.slice(0, -1) : token;
    const a = body[0];
    const b = body[1];
    const suffix = body.slice(2);

    if (!a || !b || rankIndex(a) < 0 || rankIndex(b) < 0) {
      throw new Error(`Malformed token: ${token}`);
    }

    if (a === b) {
      if (suffix) throw new Error(`Malformed pair token: ${token}`);
      const from = rankIndex(a);
      if (plus) {
        for (let i = 0; i <= from; i++) set(RANKS[i]! + RANKS[i]!);
      } else {
        set(a + a);
      }
      continue;
    }

    if (suffix !== "s" && suffix !== "o") throw new Error(`Malformed token: ${token}`);
    const hi = rankIndex(a);
    const lo = rankIndex(b);
    if (hi > lo) throw new Error(`High card must come first: ${token}`);
    if (plus) {
      for (let k = lo; k > hi; k--) set(`${a}${RANKS[k]}${suffix}`);
    } else {
      set(`${a}${b}${suffix}`);
    }
  }

  return range;
}

/** Percentage of all 1326 combos that are raised, weighted by frequency. */
export function rangePercent(range: Range): number {
  let weighted = 0;
  for (const h of ALL_HANDS) weighted += (range[h] ?? 0) * combos(h);
  return (weighted / TOTAL_COMBOS) * 100;
}
