/** Plain-English beginner copy for the acronyms the UI shows. */

export interface Term {
  /** Short caption shown always for the selected mode/position. */
  caption: string;
  /** Slightly longer hover/focus tooltip. */
  tooltip: string;
}

export const GLOSSARY: Record<string, Term> = {
  ALL: {
    caption: "All seats — hands from every position, mixed together.",
    tooltip: "Hands from every seat, mixed together.",
  },
  UTG: {
    caption: "Under the gun — first to act, tightest opens.",
    tooltip:
      "Under the gun. First to act after the blinds. Tightest opens — lots of players still to act.",
  },
  MP: {
    caption: "Middle position — one seat after UTG, a bit wider.",
    tooltip:
      "Middle position (also called the hijack). One seat after UTG. A bit wider than UTG.",
  },
  CO: {
    caption: "Cutoff — seat before the button, opens wider.",
    tooltip:
      "Cutoff. Seat before the button. You can open more hands because only the button and blinds are left.",
  },
  BTN: {
    caption: "Button — dealer seat, last to act after the flop. Widest opens.",
    tooltip: "Button. Dealer seat, last to act after the flop. Widest opens.",
  },
  SB: {
    caption: "Small blind — already half a bet in, and you act first after the flop.",
    tooltip:
      "Small blind. Already has half a bet in. You act first after the flop, so open a bit tighter than the button.",
  },
  BB: {
    caption: "Big blind — posts the full blind and acts last before the flop.",
    tooltip:
      "Big blind. Already has a full bet in. When everyone folds to the BB, they check and see a flop — they never open-raise, which is why we don't drill this seat.",
  },

  LEAKS: {
    caption: "Leaks — hands you've been getting wrong. Practice until they stick.",
    tooltip: "Hands you've been getting wrong. Practice those until they stick.",
  },
  FOLD: {
    caption: "Fold — don't put money in.",
    tooltip: "Don't put money in. The hand is over for you.",
  },
  RAISE: {
    caption: "Raise — open the pot.",
    tooltip: "Put in a raise (here: open the pot). Everyone left can fold, call, or 3-bet.",
  },
  FOLDED_TO_YOU: {
    caption: "Folded to you — you're first to put money in.",
    tooltip: "Everyone before you folded, so you're first to put money in.",
  },
};

const RANK_NAME: Record<string, string> = {
  A: "Ace",
  K: "King",
  Q: "Queen",
  J: "Jack",
  T: "Ten",
  "9": "Nine",
  "8": "Eight",
  "7": "Seven",
  "6": "Six",
  "5": "Five",
  "4": "Four",
  "3": "Three",
  "2": "Two",
};

/** "ATs" -> "Ace-Ten suited — both cards the same suit. T is 10." */
export function describeHand(hand: string): string {
  const a = RANK_NAME[hand[0] ?? ""] ?? hand[0] ?? "";
  const b = RANK_NAME[hand[1] ?? ""] ?? hand[1] ?? "";
  const tNote = hand.slice(0, 2).includes("T") ? " T is 10." : "";
  if (hand.length === 2) {
    return `A pair of ${a}s — two cards of the same rank.${tNote}`;
  }
  if (hand.endsWith("s")) {
    return `${a}-${b} suited — both cards the same suit.${tNote}`;
  }
  return `${a}-${b} offsuit — the two cards are different suits.${tNote}`;
}
