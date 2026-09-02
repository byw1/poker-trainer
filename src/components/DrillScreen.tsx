import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RangeGrid } from "./RangeGrid";
import { Keycap, SeatRing, SeatIcon } from "./Bits";
import { PlayingCard, type PlayingCardRank, type PlayingCardSuit } from "./PlayingCard";
import { POSITIONS, type Position } from "@/lib/charts";
import type { Drill, Action, GenerateOptions, Question, Result } from "@/drills/types";
import { recordAnswer, recordDaily, type Stats } from "@/lib/storage";
import { DAILY_COUNT, dailyQuestions, todayKey } from "@/lib/daily";
import { GLOSSARY, describeHand } from "@/lib/glossary";
import { Tooltip } from "./Tooltip";
import { initSound, setSoundEnabled, sound } from "@/lib/sound";
import { InsightCard } from "./InsightCard";
import { Button } from "./ui/Button";
import { useIsPhone } from "@/lib/useViewport";
import { StreamText } from "./ui/StreamText";
import { LogoMark } from "./Logo";
import { useDisplay } from "@/lib/display";
import { DisplaySheet } from "./DisplaySheet";

import { BADGES, type BadgeId } from "@/lib/progress";

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
  width = 128,
}: {
  rank: PlayingCardRank;
  suit: PlayingCardSuit;
  tilt: number;
  delay: number;
  width?: number;
}) {
  return (
    <div
      className="card-deal-3d"
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
          <PlayingCard rank={rank} suit={suit} width={width} />
        </div>
        <div
          className="card-face absolute inset-0"
          style={{ transform: "rotateY(180deg)" }}
          aria-hidden
        >
          <PlayingCard rank={rank} suit={suit} width={width} faceDown />
        </div>
      </div>
    </div>
  );
}


export type Mode = "ALL" | Position | "LEAKS";
const MODES: Mode[] = ["ALL", ...POSITIONS, "LEAKS"];
const MODE_LABEL: Record<string, string> = { ALL: "All", LEAKS: "Leaks" };

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
  onGlossary: () => void;
  suspended?: boolean;
  daily?: boolean;
  onExitDaily?: () => void;
  initialMode?: Mode;
}

export function DrillScreen({
  drill,
  stats,
  onStats,
  onHome,
  onChart,
  onGlossary,
  suspended = false,
  daily = false,
  onExitDaily,
  initialMode = "ALL",
}: Props) {
  const isPhone = useIsPhone();
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
  const [pressed, setPressed] = useState<Action | null>(null);
  const [newBadges, setNewBadges] = useState<BadgeId[]>([]);
  const { display, set: setDisplay } = useDisplay();
  const [sheetOpen, setSheetOpen] = useState(false);
  const soundOn = display.sound;

  useEffect(() => {
    initSound();
  }, []);

  useEffect(() => {
    setSoundEnabled(display.sound);
  }, [display.sound]);

  const toggleSound = useCallback(() => {
    setDisplay({ sound: !soundOn });
    if (!soundOn) sound.flip();
  }, [setDisplay, soundOn]);

  useEffect(() => {
    if (result && verdictRef.current) {
      verdictRef.current.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "auto" });
    }
  }, [result]);

  const seed = useMemo(() => Math.random(), [question]);

  useEffect(() => {
    sound.deal();
    const t = window.setTimeout(() => sound.flip(), 240);
    return () => window.clearTimeout(t);
  }, [question]);
  const cards = handCards(question.prompt.hand, seed);

  const answer = useCallback(
    (action: Action) => {
      if (result) return;
      setPressed(action);
      if (action === "raise") sound.raise();
      else sound.fold();
      const r = drill.checkAnswer(question, action);
      setResult(r);
      window.setTimeout(() => (r.correct ? sound.correct() : sound.incorrect()), 180);
      let updated = recordAnswer(
        stats,
        question.prompt.position,
        question.prompt.hand,
        r.correct,
        action,
      );
      if (daily) {
        const score = dailyScore + (r.correct ? 1 : 0);
        setDailyScore(score);
        if (dailyIndex + 1 >= DAILY_COUNT) updated = recordDaily(updated, dateKey, score);
      }
      const fresh = updated.badges.filter((b) => !stats.badges.includes(b));
      if (fresh.length > 0) {
        setNewBadges(fresh);
        window.setTimeout(() => setNewBadges([]), 2000);
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
        setPressed(null);
        setDailyIndex(i);
        setQuestion(dailySet[i] ?? drill.generateQuestion(Math.random));
        return;
      }
      setResult(null);
      setPressed(null);
      setQuestion(drill.generateQuestion(Math.random, optionsFor(m)));
    },
    [drill, mode, optionsFor, daily, dailyIndex, dailySet],
  );

  const playAgain = useCallback(() => {
    setDailyIndex(0);
    setDailyScore(0);
    setResult(null);
    setPressed(null);
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
      if (e.key === "g" || e.key === "G") {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        e.preventDefault();
        onGlossary();
        return;
      }
      if (e.key === "?") {
        e.preventDefault();
        onChart(question.prompt.position);
        return;
      }
      if (dailyDone) {
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
      else if (!result && (e.key === "c" || e.key === "C")) answer("call");
      else if (!result && (e.key === "r" || e.key === "R")) answer("raise");
      else if (result && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answer, next, pickMode, result, onChart, onGlossary, suspended, question, daily, dailyDone]);

  const accuracy =
    stats.totalAnswered > 0 ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) : 0;
  const handsLabel = stats.totalAnswered === 1 ? "1 hand" : `${stats.totalAnswered} hands`;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[440px] flex-col items-center px-4 py-6 text-center sm:max-w-[720px] sm:items-stretch sm:px-6 sm:py-8 sm:text-left">
      <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-[color:var(--graphite)]">
        <button
          onClick={goHome}
          aria-label="Home"
          className="inline-flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)]"
        >
          <LogoMark size={32} />
          <span className="hidden font-bold tracking-[-0.02em] text-[color:var(--ink)] sm:inline">
            Poker Trainer
          </span>
        </button>
        <div className="ml-auto flex items-center gap-2">
        <button
            onClick={toggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? "Mute sound" : "Unmute sound"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[4px] border border-[color:var(--bone)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)]"
            style={{ color: soundOn ? "var(--ink)" : "var(--graphite)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
              <path
                d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              {soundOn ? (
                <path
                  d="M15.5 9.5a4 4 0 0 1 0 5M18 7a7.5 7.5 0 0 1 0 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M16 9.5l5 5M21 9.5l-5 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
          <button
            onClick={() => setSheetOpen(true)}
            aria-label="Display settings"
            className="inline-flex h-11 items-center gap-1.5 rounded-[4px] border border-[color:var(--bone)] px-3 text-[13px] text-[color:var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden>
              <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path
                d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            Display
          </button>
        </div>
        {stats.totalAnswered > 0 ? (
          <div className="flex w-full flex-wrap items-baseline gap-x-4 gap-y-1 sm:ml-auto sm:w-auto sm:gap-6">
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
              <div className="flex w-[min(240px,100%)] gap-1" aria-label={`Progress ${dailyIndex + 1} of ${DAILY_COUNT}`}>
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
          className="no-scrollbar -mx-4 flex max-w-full snap-x snap-mandatory items-stretch overflow-x-auto px-4 sm:mx-0 sm:inline-flex sm:overflow-hidden sm:rounded-[3px] sm:border sm:border-[color:var(--bone)] sm:px-0"
        >
          {MODES.map((m) => (
            <button
              key={m}
              onClick={() => pickMode(m)}
              aria-pressed={m === mode}
              title={GLOSSARY[m]?.title ?? m}
              className="inline-flex h-11 shrink-0 snap-start items-center gap-1.5 whitespace-nowrap border border-[color:var(--bone)] px-3 text-[13px] font-medium sm:h-auto sm:border-0 sm:border-r sm:py-1.5 sm:last:border-r-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[color:var(--ink)]"
              style={
                m === mode
                  ? { backgroundColor: "var(--ink)", color: "var(--paper)" }
                  : { color: "var(--ink)" }
              }
            >
              <SeatIcon kind={m} size={16} />
              {MODE_LABEL[m] ?? m}
            </button>
          ))}
        </div>
        )}
        {!daily && display.captions ? (
          <p className="max-w-full text-center text-[13px] text-[color:var(--graphite)]">
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
          <p className="mt-2 text-[48px] sm:text-[64px] font-bold leading-none tracking-[-0.03em] tabular-nums text-[color:var(--ink)]">
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
          <div className="mt-8 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Button variant="primary" size="lg" className="h-12 w-full sm:h-[56px] sm:w-[200px]" onClick={playAgain}>
              Play again
            </Button>
            <Button variant="secondary" size="lg" className="h-12 w-full sm:h-[56px] sm:w-[200px]" onClick={goHome}>
              Back home
            </Button>
          </div>
        </div>
      ) : (
      <>
      <div className="mt-10 flex flex-col items-center">
        <div className="flex flex-col items-center gap-2">
          {display.table ? <SeatRing active={question.prompt.position} width={isPhone ? 240 : 300} hoverHelp={display.hoverHelp} /> : null}
          <Tooltip
            title={GLOSSARY['FOLDED_TO_YOU']!.title}
            text={GLOSSARY['FOLDED_TO_YOU']!.tooltip}
            enabled={display.hoverHelp}
          >
            <span className="cursor-help text-[13px] text-[color:var(--graphite)] underline decoration-dotted decoration-[color:var(--bone)] underline-offset-4">
              {question.prompt.context}
            </span>
          </Tooltip>
        </div>

        <div
          key={`${question.prompt.hand}-${seed}`}
          className={`cards-3d mt-6 flex items-center justify-center ${
            pressed === "raise" ? "cards-raised-3d" : pressed ? "cards-folded-3d" : ""
          } cards-stage`}
        >
          <DealtCard
            rank={cards[0]!.rank}
            suit={cards[0]!.suit}
            tilt={-4}
            delay={0}
            width={isPhone ? 110 : 128}
          />
          <div className={isPhone ? "-ml-4" : "-ml-6"}>
            <DealtCard
              rank={cards[1]!.rank}
              suit={cards[1]!.suit}
              tilt={5}
              delay={70}
              width={isPhone ? 110 : 128}
            />
          </div>
        </div>

        <p className="mt-4 text-[13px] text-[color:var(--graphite)]">
          <Tooltip title={question.prompt.hand} text={describeHand(question.prompt.hand)} enabled={display.hoverHelp}>
            <span className="cursor-help underline decoration-dotted decoration-[color:var(--bone)] underline-offset-4">
              {question.prompt.hand}
            </span>
          </Tooltip>
        </p>
      </div>

      {!result ? (
        <div
          className="action-dock sticky bottom-0 z-30 mt-8 grid w-full grid-cols-3 gap-2 border-t pt-3 sm:static sm:mt-10 sm:flex sm:justify-center sm:gap-4 sm:border-0 sm:pt-0"
          style={{ backgroundColor: "var(--paper)", borderColor: "var(--bone)" }}
        >
          <Button autoFocus variant="fold" size="lg" className="h-[52px] w-full text-[16px] sm:h-[56px] sm:w-[160px] sm:text-[17px]" onClick={() => answer("fold")}>
            Fold <span className="hidden sm:inline-flex"><Keycap>F</Keycap></span>
          </Button>
          <Button variant="call" size="lg" className="h-[52px] w-full text-[16px] sm:h-[56px] sm:w-[160px] sm:text-[17px]" onClick={() => answer("call")}>
            Call <span className="hidden sm:inline-flex"><Keycap>C</Keycap></span>
          </Button>
          <Button variant="raise" size="lg" className="h-[52px] w-full text-[16px] sm:h-[56px] sm:w-[160px] sm:text-[17px]" onClick={() => answer("raise")}>
            Raise <span className="hidden sm:inline-flex"><Keycap>R</Keycap></span>
          </Button>
        </div>
      ) : (
        <div className="result-fade-up mt-8 flex w-full min-w-0 flex-col items-center">
          <div
            ref={verdictRef}
            className={`flex items-center gap-3 ${result.correct ? "" : "verdict-shake"}`}
          >
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
            <p className="text-[19px] font-bold tracking-[-0.01em] text-[color:var(--ink)] sm:text-[24px]">
              {result.correct ? "Correct" : `Incorrect — best is ${result.best}`}
            </p>
          </div>
          <p className="mt-2 max-w-[46ch] text-center text-[14px] text-[color:var(--graphite)]">
            <StreamText text={result.explanation} charsPerTick={2} tickMs={9} />
          </p>

          {display.insight ? (
            <InsightCard
              hand={question.prompt.hand}
              position={question.prompt.position}
              chosen={result.chosen}
            />
          ) : null}

          {newBadges.length > 0 ? (
            <div className="insight-in mt-3 flex flex-wrap justify-center gap-2">
              {newBadges.map((b) => (
                <span
                  key={b}
                  className="chip"
                  style={{ borderColor: "var(--spruce)", color: "var(--spruce)" }}
                >
                  Unlocked — {BADGES[b]?.label ?? b}
                </span>
              ))}
            </div>
          ) : null}

          {!result.correct && !daily ? (
            <button
              onClick={() => pickMode(question.prompt.position)}
              className="mt-3 text-[13px] text-[color:var(--graphite)] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)]"
            >
              Practice this seat — {question.prompt.position}
            </button>
          ) : null}

          {result.visual && display.rangeAfter ? (
            <div className="mt-7 flex w-full min-w-0 justify-center">
              <RangeGrid range={result.visual.range} highlight={result.visual.highlight} reveal />
            </div>
          ) : null}

          <Button autoFocus variant="primary" className="mt-8 min-h-[48px] w-full sm:w-auto" onClick={() => next()}>
            Next hand <span className="fine-only"><Keycap>Space</Keycap></span>
          </Button>
        </div>
      )}
      </>
      )}

      <div className="fine-only mt-auto flex flex-wrap justify-center gap-5 pt-10 text-[12px] text-[color:var(--graphite)]">
        <span className="inline-flex items-center gap-2">
          <Keycap>F</Keycap> fold
        </span>
        <span className="inline-flex items-center gap-2">
          <Keycap>C</Keycap> call
        </span>
        <span className="inline-flex items-center gap-2">
          <Keycap>R</Keycap> raise
        </span>
        <span className="inline-flex items-center gap-2">
          <Keycap>Space</Keycap> next
        </span>
        <span className="inline-flex items-center gap-2">
          <Keycap>?</Keycap> charts
        </span>
        <span className="inline-flex items-center gap-2">
          <Keycap>G</Keycap> glossary
        </span>
      </div>

      {sheetOpen ? (
        <DisplaySheet
          display={display}
          onChange={setDisplay}
          onClose={() => setSheetOpen(false)}
          links={[
            { label: "Glossary", onClick: () => { setSheetOpen(false); onGlossary(); } },
            {
              label: "Charts",
              onClick: () => {
                setSheetOpen(false);
                onChart(question.prompt.position);
              },
            },
          ]}
        />
      ) : null}

    </main>
  );
}
