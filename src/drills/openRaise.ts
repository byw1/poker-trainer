import { CHARTS, POSITIONS, POSITION_LABEL, type Position } from "@/lib/charts";
import { randomHand } from "@/lib/handClasses";
import type { Action, Drill, GenerateOptions, Question, Result } from "./types";

export const openRaiseDrill: Drill = {
  id: "open-raise-6max",
  name: "Open-raise decisions",
  description: "6-max cash. Folded to you. Raise first in, or fold.",

  generateQuestion(rng: () => number, options: GenerateOptions = {}): Question {
    const position =
      options.position ?? (POSITIONS[Math.floor(rng() * POSITIONS.length)] as Position);
    const leaks = options.leakHands ?? [];
    // Oversample leaks, but keep a third random so it never loops one combo.
    const hand =
      leaks.length > 0 && rng() < 0.65
        ? (leaks[Math.floor(rng() * leaks.length)] as string)
        : randomHand(rng);
    return {
      drillId: openRaiseDrill.id,
      prompt: {
        hand,
        position,
        context: "Folded to you",
      },
      options: ["fold", "call", "raise"],
    };
  },

  checkAnswer(q: Question, answer: Action): Result {
    const { hand, position } = q.prompt;
    const range = CHARTS[position];
    const freq = range[hand] ?? 0;
    const best: Action = freq >= 0.5 ? "raise" : "fold";
    const correct = answer !== "call" && answer === best;

    const reason = REASONS[position][best === "raise" ? "in" : "out"];
    const why = `${hand} ${best === "raise" ? "opens" : "folds"} from ${POSITION_LABEL[position].toLowerCase()}. ${reason}`;
    const limpNote =
      position === "SB"
        ? " Some solvers mix a limp from the small blind; this trainer uses raise-or-fold so the drill stays one decision."
        : "";
    const explanation =
      answer === "call"
        ? `GTO almost never limps when folded to you from ${POSITION_LABEL[position].toLowerCase()}. Call here is a limp — raise or fold instead. ${why}${limpNote}`
        : why;

    return {
      correct,
      chosen: answer,
      best,
      explanation,
      visual: { type: "range", range, highlight: hand },
    };
  },
};

const REASONS: Record<Position, { in: string; out: string }> = {
  UTG: {
    in: "Four players still act behind you, so only hands that flop strong or dominate the hands that call belong here.",
    out: "With four players left to act, marginal broadways and small pairs get outdrawn or dominated too often to raise first in.",
  },
  MP: {
    in: "Three players remain behind, so the range loosens to strong pairs, suited aces and the better connectors.",
    out: "Three players still act behind you, so this hand is a step too thin to open and plays badly out of position.",
  },
  CO: {
    in: "Only three seats act behind you and two of them are blinds, so hands like this open for value and to steal.",
    out: "Even with the cutoff's wider range, this hand has too little equity when it gets called or three-bet.",
  },
  BTN: {
    in: "Only the blinds are left, and you have position on every street, so the button opens far wider than any other seat.",
    out: "The button opens very wide, but this hand still lacks the playability to profit even against two blinds.",
  },
  SB: {
    in: "Only the big blind remains, so raising takes the pot down often enough to open hands you would fold earlier.",
    out: "You are out of position for the rest of the hand, so this one is not worth opening even heads-up against the big blind.",
  },
};
