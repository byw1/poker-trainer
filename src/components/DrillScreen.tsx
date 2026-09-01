import { useCallback, useEffect, useMemo, useState } from "react";
import { RangeGrid } from "./RangeGrid";
import { POSITION_LABEL, type Position } from "@/lib/charts";
import type { Drill, Action, Question, Result } from "@/drills/types";
import { recordAnswer, type Stats } from "@/lib/storage";

const SUITS = [
  { symbol: "♠", key: "s" },
  { symbol: "♥", key: "h" },
  { symbol: "♦", key: "d" },
  { symbol: "♣", key: "c" },
];

function handCards(hand: string, rng: number): { rank: string; suit: string }[] {
  const a = hand[0] ?? "A";
  const b = hand[1] ?? "A";
  const i = Math.floor(rng * 4) % 4;
  const j = hand.endsWith("s") ? i : (i + 1 + Math.floor(rng * 3)) % 4;
  return [
    { rank: a, suit: SUITS[i]!.symbol },
    { rank: b, suit: SUITS[j]!.symbol },
  ];
}

interface Props {
  drill: Drill;
  stats: Stats;
  onStats: (s: Stats) => void;
  onHome: () => void;
  onChart: (position: Position) => void;
  suspended?: boolean;
}

export function DrillScreen({ drill, stats, onStats, onHome, onChart, suspended = false }: Props) {
  const [question, setQuestion] = useState<Question>(() => drill.generateQuestion(Math.random));
  const [result, setResult] = useState<Result | null>(null);
  const seed = useMemo(() => Math.random(), [question]);
  const cards = handCards(question.prompt.hand, seed);

  const answer = useCallback(
    (action: Action) => {
      if (result) return;
      const r = drill.checkAnswer(question, action);
      setResult(r);
      onStats(recordAnswer(stats, question.prompt.position, question.prompt.hand, r.correct));
    },
    [drill, question, result, stats, onStats],
  );

  const next = useCallback(() => {
    setResult(null);
    setQuestion(drill.generateQuestion(Math.random));
  }, [drill]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (suspended) return;
      if (e.key === "?") {
        e.preventDefault();
        onChart(question.prompt.position);
        return;
      }
      if (!result && (e.key === "f" || e.key === "F")) answer("fold");
      else if (!result && (e.key === "r" || e.key === "R")) answer("raise");
      else if (result && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answer, next, result, onChart, suspended, question]);

  const accuracy =
    stats.totalAnswered > 0 ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) : 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[640px] flex-col px-6 py-8">
      <div className="flex items-center justify-between text-[13px] text-[color:var(--graphite)]">
        <button
          onClick={onHome}
          className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)]"
        >
          Poker Trainer
        </button>
        <div className="flex gap-6">
          <span>{accuracy}% accurate</span>
          <span>Streak {stats.currentStreak}</span>
          <span>{stats.totalAnswered} hands</span>
        </div>
      </div>

      <div className="mt-14 text-center">
        <p className="text-[13px] text-[color:var(--graphite)]">
          {POSITION_LABEL[question.prompt.position]} ({question.prompt.position}) —{" "}
          {question.prompt.context}
        </p>
        <div className="mt-4 flex items-center justify-center gap-4 text-[56px] font-medium leading-none text-[color:var(--ink)]">
          {cards.map((c, i) => (
            <span key={i}>
              {c.rank}
              <span
                style={{
                  color: c.suit === "♥" || c.suit === "♦" ? "var(--crimson)" : "var(--ink)",
                }}
              >
                {c.suit}
              </span>
            </span>
          ))}
        </div>
        <p className="mt-3 text-[13px] text-[color:var(--graphite)]">{question.prompt.hand}</p>
      </div>

      {!result ? (
        <div className="mt-12 flex justify-center gap-3">
          <button
            autoFocus
            onClick={() => answer("fold")}
            className="min-w-[140px] rounded-[3px] border border-[color:var(--bone)] px-6 py-3 text-[15px] font-medium text-[color:var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)]"
          >
            Fold <span className="ml-2 text-[color:var(--graphite)]">F</span>
          </button>
          <button
            onClick={() => answer("raise")}
            className="min-w-[140px] rounded-[3px] border border-[color:var(--ink)] px-6 py-3 text-[15px] font-medium text-[color:var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)]"
          >
            Raise <span className="ml-2 text-[color:var(--graphite)]">R</span>
          </button>
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="flex h-6 w-6 items-center justify-center rounded-full text-[14px]"
              style={{
                backgroundColor: result.correct ? "var(--spruce)" : "var(--ink)",
                color: "var(--paper)",
              }}
            >
              {result.correct ? "✓" : "✕"}
            </span>
            <p className="text-[17px] font-bold text-[color:var(--ink)]">
              {result.correct ? "Correct" : `Incorrect — best is ${result.best}`}
            </p>
          </div>
          <p className="mt-2 max-w-[46ch] text-center text-[14px] text-[color:var(--graphite)]">
            {result.explanation}
          </p>

          {result.visual ? (
            <div className="mt-8 flex w-full justify-center">
              <RangeGrid
                range={result.visual.range}
                highlight={result.visual.highlight}
                reveal
              />
            </div>
          ) : null}

          <button
            autoFocus
            onClick={next}
            className="mt-8 rounded-[3px] bg-[color:var(--spruce)] px-6 py-3 text-[15px] font-medium text-[color:var(--paper)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)]"
          >
            Next hand <span className="ml-2 opacity-70">Space</span>
          </button>
        </div>
      )}

      <p className="mt-auto pt-10 text-center text-[12px] text-[color:var(--graphite)]">
        <span className="inline-flex gap-5"><span>F fold</span><span>R raise</span><span>Space next</span><span>? charts</span></span>
      </p>
    </main>
  );
}
