import type { HandClass } from "@/lib/handClasses";
import type { Range } from "@/lib/rangeParser";
import type { Position } from "@/lib/charts";

export type Action = "fold" | "raise";

export interface Question {
  drillId: string;
  prompt: {
    hand: HandClass;
    position: Position;
    context: string;
  };
  options: Action[];
}

export interface Result {
  correct: boolean;
  chosen: Action;
  best: Action;
  explanation: string;
  visual?: { type: "range"; range: Range; highlight: HandClass };
}

export interface Drill {
  id: string;
  name: string;
  description: string;
  generateQuestion(rng: () => number): Question;
  checkAnswer(q: Question, answer: Action): Result;
}
