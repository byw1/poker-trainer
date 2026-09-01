import { CHARTS, POSITIONS, POSITION_LABEL, type Position } from "@/lib/charts";
import { randomHand } from "@/lib/handClasses";
import type { Action, Drill, Question, Result } from "./types";

export const openRaiseDrill: Drill = {
  id: "open-raise-6max",
  name: "Open-raise decisions",
  description: "6-max cash. Folded to you. Raise first in, or fold.",

  generateQuestion(rng: () => number): Question {
    const position = POSITIONS[Math.floor(rng() * POSITIONS.length)] as Position;
    return {
      drillId: openRaiseDrill.id,
      prompt: {
        hand: randomHand(rng),
        position,
        context: "Folded to you",
      },
      options: ["fold", "raise"],
    };
  },

  checkAnswer(q: Question, answer: Action): Result {
    const range = CHARTS[q.prompt.position];
    const freq = range[q.prompt.hand] ?? 0;
    const best: Action = freq >= 0.5 ? "raise" : "fold";
    const correct = answer === best;
    const label = POSITION_LABEL[q.prompt.position];
    const explanation =
      best === "raise"
        ? `${q.prompt.hand} is inside the ${label} opening range, so it raises first in.`
        : `${q.prompt.hand} is outside the ${label} opening range, so it folds.`;

    return {
      correct,
      chosen: answer,
      best,
      explanation,
      visual: { type: "range", range, highlight: q.prompt.hand },
    };
  },
};
