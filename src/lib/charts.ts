import { parseRange, type Range } from "./rangeParser";

/**
 * Source: v1 training set for 6-max 100bb cash RFI. Frequencies (~13/18/26/44/40%)
 * match commonly published GTO opening-range summaries such as PokerPro's preflop
 * strategy (https://pokerpro.tools/articles/preflop-strategy) and equivalent 6-max
 * cash charts. Exact hand lists are this spec's starting set, not a solver dump.
 */

export type Position = "UTG" | "MP" | "CO" | "BTN" | "SB";

export const POSITIONS: Position[] = ["UTG", "MP", "CO", "BTN", "SB"];

const SHORTHAND: Record<Position, string[]> = {
  UTG: ["33+", "A8s+", "A5s", "KTs+", "QTs+", "JTs", "T9s", "AJo+", "KQo"],
  MP: [
    "22+",
    "A4s+",
    "K9s+",
    "Q9s+",
    "J9s+",
    "T9s",
    "98s",
    "87s",
    "ATo+",
    "KJo+",
  ],
  CO: [
    "22+",
    "A2s+",
    "K7s+",
    "Q8s+",
    "J8s+",
    "T8s",
    "98s",
    "87s",
    "76s",
    "65s",
    "A8o+",
    "KTo+",
    "QTo+",
    "JTo",
  ],
  BTN: [
    "22+",
    "A2s+",
    "K2s+",
    "Q2s+",
    "J4s+",
    "T6s+",
    "95s+",
    "85s+",
    "75s+",
    "64s+",
    "54s",
    "A2o+",
    "K9o+",
    "Q8o+",
    "J9o+",
    "T9o",
  ],
  SB: [
    "22+",
    "A2s+",
    "K2s+",
    "Q5s+",
    "J7s+",
    "T7s+",
    "96s+",
    "86s+",
    "75s+",
    "65s",
    "A2o+",
    "K8o+",
    "Q9o+",
    "J9o+",
    "T9o",
  ],
};

export const CHARTS: Record<Position, Range> = {
  UTG: parseRange(SHORTHAND.UTG),
  MP: parseRange(SHORTHAND.MP),
  CO: parseRange(SHORTHAND.CO),
  BTN: parseRange(SHORTHAND.BTN),
  SB: parseRange(SHORTHAND.SB),
};

export const POSITION_LABEL: Record<Position, string> = {
  UTG: "Under the gun",
  MP: "Middle position",
  CO: "Cutoff",
  BTN: "Button",
  SB: "Small blind",
};
