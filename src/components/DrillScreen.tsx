import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RangeGrid } from "./RangeGrid";
import { Keycap, SeatRing } from "./Bits";
import { PlayingCard, type PlayingCardRank, type PlayingCardSuit } from "./PlayingCard";
import { POSITIONS, type Position } from "@/lib/charts";
import type { Drill, Action, GenerateOptions, Question, Result } from "@/drills/types";
import { recordAnswer, recordDaily, type Stats } from "@/lib/storage";
import { DAILY_COUNT, dailyQuestions, todayKey } from "@/lib/daily";
import { GLOSSARY, describeHand } from "@/lib/glossary";
import { Tooltip } from "./Tooltip";

const SUITS: PlayingCardSuit[] = ["spades", "hearts", "diamonds", "clubs"];

function toRank(c: string): PlayingCardRank {
  return (c === "T" ? "10" : c) as PlayingCardRank;
}

function handCards(hand: string, rng: number): { rank: PlayingCardRank; suit: PlayingCardSuit }[] {
  const a = hand[0] ?? "A";
  const b = hand[1] ?? "A";
  const i = Math.floor(rng * 4) % 4;
  const j = hand.endsWith("s") ? i : (i + 1 + Math.floor(rng * 3)) % 4;
  return [
    { rank: toRank(a), suit: SUITS[i]! },
    { rank: toRank(b), suit: SUITS[j]! },
  ];
}

/** Deals face-down, then flips face-up in place. */
function DealtCard({
  rank,
  suit,
  tilt,
  delay,
}: {
  rank: PlayingCardRank;
  suit: PlayingCardSuit;
  tilt: number;
  delay: number;
}) {
  return (
    <div
      className="card-deal"
      style={
        {
          perspective: "900px",
          "--card-tilt": `${tilt}deg`,
          "--card-delay": `${delay}ms`,
        } as React.CSSProperties
      }
    >
      <div className="card-flipper relative">
        <div className="card-face">
          <PlayingCard rank={rank} suit={suit} width={128} />
        </div>
        <div
          className="card-face absolute inset-0"
          style={{ transform: "rotateY(180deg)" }}
          aria-hidden
        >
          <PlayingCard rank={rank} suit={suit} width={128} faceDown />
        </div>
      </div>
    </div>
  );
}


export type Mode = "ALL" | Position | "LEAKS";
const MODES: Mode[] = ["ALL", ...POSITIONS, "LEAKS"];
const MODE_LABEL: Record<string, string> = { ALL: "All", LEAKS: "Leaks" };

/** Hand classes the user has missed, worst accuracy first, then most misses. */
function leakHands(stats: Stats): string[] {
  return Object.entries(stats.byHand)
    .filter(([, v]) => v.answered >= 1 && v.correct < v.answered)
    .sort((a, b) => {
      const accA = a[1].correct / a[1].answered;
      const accB = b[1].correct / b[1].answered;
      if (accA !== accB) return accA - accB;
      return b[1].answered - b[1].correct - (a[1].answered - a[1].correct);
    })
    .map(([h]) => h);
}

interface Props {
  drill: Drill;
  stats: Stats;
  onStats: (s: Stats) => void;
  onHome: () => void;
  onChart: (position: Position) => void;
  suspended?: boolean;
  /** Daily challenge: 10 fixed, date-seeded hands. */
  daily?: boolean;
  onExitDaily?: () => void;
  /** Practice mode to start in (e.g. "LEAKS" from a Home leak row). */
  initialMode?: Mode;
}

export function DrillScreen({
  drill,
  stats,
  onStats,
  onHome,
  onChart,
  suspended = false,
  daily = false,
  onExitDaily,
  initialMode = "ALL",
}: Props) {
  const dateKey = useMemo(() => todayKey(), []);
  const dailySet = useMemo(
    () => (daily ? dailyQuestions(drill, dateKey) : []),
    [daily, drill, dateKey],
  );
  const [dailyIndex, setDailyIndex] = useState(0);
  const [dailyScore, setDailyScore] = useState(0);
  const dailyDone = daily && dailyIndex >= DAILY_COUNT;
  const [mode, setMode] = useState<Mode>(initialMode);
  const leaks = useMemo(() => leakHands(stats), [stats]);
  const leaksRef = useRef(leaks);
  leaksRef.current = leaks;
  const verdictRef = useRef<HTMLDivElement>(null);

  const optionsFor = useCallback((m: Mode): GenerateOptions => {
    if (m === "ALL") return {};
    if (m === "LEAKS") return { leakHands: leaksRef.current };
    return { position: m };
  }, []);

  const [question, setQuestion] = useState<Question>(
    () =>
      (daily ? dailySet[0] : undefined) ??
      drill.generateQuestion(Math.random, optionsFor(initialMode)),
  );
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (result && verdictRef.current) {
      verdictRef.current.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "auto" });
    }
  }, [result]);

  const seed = useMemo(() => Math.random(), [question]);
  const cards = handCards(question.prompt.hand, seed);


  const answer = useCallback(
    (action: Action) => {
      if (result) return;
      const r = drill.checkAnswer(question, action);
      setResult(r);
      let updated = recordAnswer(stats, question.prompt.position, question.prompt.hand, r.correct);
      if (daily) {
        const score = dailyScore + (r.correct ? 1 : 0);
        setDailyScore(score);
        if (dailyIndex + 1 >= DAILY_COUNT) updated = recordDaily(updated, dateKey, score);
      }
      onStats(updated);
    },
    [drill, question, result, stats, onStats, daily, dailyIndex, dailyScore, dateKey],
  );

  const next = useCallback(
    (m: Mode = mode) => {
      if (daily) {
        const i = dailyIndex + 1;
        if (i >= DAILY_COUNT) {
          setDailyIndex(i);
          return;
        }
        setResult(null);
        setDailyIndex(i);
        setQuestion(dailySet[i] ?? drill.generateQuestion(Math.random));
        return;
      }
      setResult(null);
      setQuestion(drill.generateQuestion(Math.random, optionsFor(m)));
    },
    [drill, mode, optionsFor, daily, dailyIndex, dailySet],
  );

  // Replay today's same 10 hands; Back home is what leaves daily mode.
  const playAgain = useCallback(() => {
    setDailyIndex(0);
    setDailyScore(0);
    setResult(null);
    setQuestion(dailySet[0] ?? drill.generateQuestion(Math.random));
  }, [drill, dailySet]);

  const goHome = useCallback(() => {
    onExitDaily?.();
    onHome();
  }, [onExitDaily, onHome]);

  const pickMode = useCallback(
    (m: Mode) => {
      setMode(m);
      next(m);
    },
    [next],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (suspended) return;
      if (e.key === "?") {
        e.preventDefault();
        onChart(question.prompt.position);
        return;
      }
      if (dailyDone) {
        // The round is over; don't let Space re-trigger the focused button.
        if (e.key === " ") e.preventDefault();
        return;
      }
      const plain = !daily && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey;
      if (plain && e.key >= "1" && e.key <= "5") {
        e.preventDefault();
        pickMode(POSITIONS[Number(e.key) - 1] as Position);
        return;
      }
      if (plain && (e.key === "0" || e.key === "a")) {
        e.preventDefault();
        pickMode("ALL");
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
  }, [answer, next, pickMode, result, onChart, suspended, question, daily, dailyDone]);

  const accuracy =
    stats.totalAnswered > 0 ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) : 0;
  const handsLabel = stats.totalAnswered === 1 ? "1 hand" : `${stats.totalAnswered} hands`;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[720px] flex-col px-6 py-8">
      <div className="flex items-center justify-between text-[13px] text-[color:var(--graphite)]">
        <button
          onClick={goHome}
          className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)]"
        >
          Poker Trainer
        </button>
        {stats.totalAnswered > 0 ? (
          <div className="flex items-baseline gap-6">
            <span>{accuracy}% accurate</span>
            <span>
              Streak{" "}
              <span className="text-[19px] font-bold text-[color:var(--ink)]">
                {stats.currentStreak}
              </span>
            </span>
            <span>{handsLabel}</span>
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col items-center gap-2">
        {daily ? (
          dailyDone ? null : (
            <div className="flex flex-col items-center gap-2">
              <p className="text-[15px] font-bold text-[color:var(--ink)]">Today&rsquo;s 10</p>
              <div className="flex w-[200px] gap-1" aria-label={`Progress ${dailyIndex + 1} of ${DAILY_COUNT}`}>
                {Array.from({ length: DAILY_COUNT }).map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 flex-1 rounded-[1px]"
                    style={{
                      backgroundColor: i < dailyIndex + 1 ? "var(--ink)" : "var(--bone)",
                    }}
                  />
                ))}
              </div>
            </div>
          )
        ) : (
        <div
          role="group"
          aria-label="Practice mode"
          className="inline-flex overflow-hidden rounded-[3px] border border-[color:var(--bone)]"
        >
          {MODES.map((m) => (
            <Tooltip key={m} text={GLOSSARY[m]?.tooltip ?? m} focusable={false}>
            <button
              onClick={() => pickMode(m)}
              aria-pressed={m === mode}
              className="border-r border-[color:var(--bone)] px-3 py-1.5 text-[13px] font-medium last:border-r-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[color:var(--ink)]"
              style={
                m === mode
                  ? { backgroundColor: "var(--ink)", color: "var(--paper)" }
                  : { color: "var(--ink)" }
              }
            >
              {MODE_LABEL[m] ?? m}
            </button>
            </Tooltip>
          ))}
        </div>
        )}
        {!daily ? (
          <p className="text-[13px] text-[color:var(--graphite)]">
            {GLOSSARY[mode]?.caption ?? ""}
          </p>
        ) : null}
        {!daily && mode === "LEAKS" && leaks.length === 0 ? (
          <p className="text-[13px] text-[color:var(--graphite)]">
            Play a round first — leaks appear after misses
          </p>
        ) : null}
      </div>

      {dailyDone ? (
        <div className="mt-16 flex flex-col items-center">
          <p className="text-[13px] text-[color:var(--graphite)]">Today&rsquo;s 10 &mdash; {dateKey}</p>
          <p className="mt-2 text-[64px] font-bold leading-none tracking-[-0.03em] tabular-nums text-[color:var(--ink)]">
            {dailyScore}/10
          </p>
          <p className="mt-4 max-w-[42ch] text-center text-[15px] text-[color:var(--graphite)]">
            {dailyScore === 10
              ? "Clean sweep. Every open matched the chart."
              : dailyScore >= 8
                ? "Solid round. A couple of borderline spots to review in the charts."
                : dailyScore >= 5
                  ? "Half the spots landed. Drill the seats that tripped you up."
                  : "Rough round — open the charts and work one position at a time."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={playAgain}
              className="h-[56px] w-[200px] rounded-[3px] text-[17px] font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)]"
              style={{ backgroundColor: "var(--spruce)", color: "var(--paper)" }}
            >
              Play again
            </button>
            <button
              onClick={goHome}
              className="h-[56px] w-[200px] rounded-[3px] border border-[color:var(--bone)] text-[17px] font-medium text-[color:var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)]"
            >
              Back home
            </button>
          </div>
        </div>
      ) : (
      <>
      <div className="mt-10 flex flex-col items-center">
        <div className="flex flex-col items-center gap-2">
          <SeatRing active={question.prompt.position} width={300} />
          <Tooltip text={GLOSSARY['FOLDED_TO_YOU']!.tooltip}>
            <span className="cursor-help text-[13px] text-[color:var(--graphite)] underline decoration-dotted decoration-[color:var(--bone)] underline-offset-4">
              {question.prompt.context}
            </span>
          </Tooltip>
        </div>


        <div key={`${question.prompt.hand}-${seed}`} className="mt-6 flex items-center">
          <DealtCard rank={cards[0]!.rank} suit={cards[0]!.suit} tilt={-4} delay={0} />
          <div className="-ml-6">
            <DealtCard rank={cards[1]!.rank} suit={cards[1]!.suit} tilt={5} delay={70} />
          </div>
        </div>

        <p className="mt-4 text-[13px] text-[color:var(--graphite)]">
          <Tooltip text={describeHand(question.prompt.hand)}>
            <span className="cursor-help underline decoration-dotted decoration-[color:var(--bone)] underline-offset-4">
              {question.prompt.hand}
            </span>
          </Tooltip>
        </p>
      </div>

      {!result ? (
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button
            autoFocus
            onClick={() => answer("fold")}
            className="inline-flex h-[56px] w-[200px] items-center justify-center gap-3 rounded-[3px] transition-transform active:scale-[0.98] text-[17px] font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)]"
            style={{ backgroundColor: "var(--bone)", color: "var(--ink)" }}
          >
            Fold <Keycap>F</Keycap>
          </button>
          <button
            onClick={() => answer("raise")}
            className="inline-flex h-[56px] w-[200px] items-center justify-center gap-3 rounded-[3px] transition-transform active:scale-[0.98] text-[17px] font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)]"
            style={{ backgroundColor: "var(--crimson)", color: "var(--paper)" }}
          >
            Raise <Keycap>R</Keycap>
          </button>
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center">
          <div ref={verdictRef} className="flex items-center gap-3">
            <span
              aria-hidden
              className="verdict-pop flex h-8 w-8 items-center justify-center rounded-full text-[17px]"
              style={{
                backgroundColor: result.correct ? "var(--spruce)" : "var(--ink)",
                color: "var(--paper)",
              }}
            >
              {result.correct ? "✓" : "✕"}
            </span>
            <p className="text-[24px] font-bold tracking-[-0.01em] text-[color:var(--ink)]">
              {result.correct ? "Correct" : `Incorrect — best is ${result.best}`}
            </p>
          </div>
          <p className="mt-2 max-w-[46ch] text-center text-[14px] text-[color:var(--graphite)]">
            {result.explanation}
          </p>

          {!result.correct && !daily ? (
            <button
              onClick={() => pickMode(question.prompt.position)}
              className="mt-3 text-[13px] text-[color:var(--graphite)] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)]"
            >
              Practice this seat — {question.prompt.position}
            </button>
          ) : null}


          {result.visual ? (
            <div className="mt-7 flex w-full justify-center">
              <RangeGrid range={result.visual.range} highlight={result.visual.highlight} reveal />
            </div>
          ) : null}

          <button
            autoFocus
            onClick={() => next()}
            className="mt-8 inline-flex items-center gap-3 rounded-[3px] bg-[color:var(--spruce)] px-6 py-3 text-[15px] font-medium text-[color:var(--paper)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)]"
          >
            Next hand <Keycap>Space</Keycap>
          </button>
        </div>
      )}

      </>
      )}

      <div className="mt-auto flex flex-wrap justify-center gap-5 pt-10 text-[12px] text-[color:var(--graphite)]">
        <span className="inline-flex items-center gap-2">
          <Keycap>F</Keycap>
          <Tooltip text={GLOSSARY['FOLD']!.tooltip}>
            <span className="cursor-help">fold</span>
          </Tooltip>
        </span>
        <span className="inline-flex items-center gap-2">
          <Keycap>R</Keycap>
          <Tooltip text={GLOSSARY['RAISE']!.tooltip}>
            <span className="cursor-help">raise</span>
          </Tooltip>
        </span>
        <span className="inline-flex items-center gap-2">
          <Keycap>Space</Keycap> next
        </span>
        <span className="inline-flex items-center gap-2">
          <Keycap>?</Keycap> charts
        </span>
      </div>
    </main>
  );
}
