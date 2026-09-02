import type { Stats } from "@/lib/storage";
import { RangeGrid } from "./RangeGrid";
import { Keycap, SeatRing } from "./Bits";
import { CHARTS, POSITIONS } from "@/lib/charts";
import { rangePercent } from "@/lib/rangeParser";
import { todayKey } from "@/lib/daily";
import { GLOSSARY } from "@/lib/glossary";
import { Tooltip } from "./Tooltip";

interface Props {
  stats: Stats;
  onStart: () => void;
  onDaily: () => void;
  onStartLeaks: () => void;
  onChart: () => void;
}

export function Home({ stats, onStart, onDaily, onStartLeaks, onChart }: Props) {
  const today = todayKey();
  const todayBest = stats.dailyBest?.[today];
  const played = stats.totalAnswered > 0;
  const accuracy = played ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) : 0;
  const btn = CHARTS.BTN;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1120px] flex-col justify-center px-6 py-16">
      <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div>
          <h1 className="text-[44px] font-bold leading-[1.02] tracking-[-0.03em] text-[color:var(--ink)]">
            Poker Trainer
          </h1>

          <div className="mt-4">
            <SeatRing active="BTN" width={300} showFolds={false} />
            <p className="mt-2 text-[13px] text-[color:var(--graphite)]">
              You are on the button. Seats go clockwise.
            </p>

          </div>

          <p className="mt-4 max-w-[40ch] text-[16px] text-[color:var(--graphite)]">
            Preflop open-raise drills for 6-max cash. Get a hand, fold or raise, see the range.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={onStart}
              className="rounded-[3px] bg-[color:var(--spruce)] px-7 py-3.5 text-[16px] font-medium text-[color:var(--paper)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)]"
            >
              Start drill
            </button>
            <button
              onClick={onDaily}
              className="rounded-[3px] border border-[color:var(--ink)] px-7 py-3.5 text-[16px] font-medium text-[color:var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)]"
            >
              Today&rsquo;s 10
            </button>
            <button
              onClick={onChart}
              className="rounded-[3px] border border-[color:var(--bone)] px-7 py-3.5 text-[16px] font-medium text-[color:var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)]"
            >
              View charts
            </button>
          </div>

          {typeof todayBest === "number" ? (
            <p className="mt-4 text-[13px] text-[color:var(--graphite)]">
              Today&rsquo;s best{" "}
              <span className="text-[15px] font-bold tabular-nums text-[color:var(--ink)]">
                {todayBest}/10
              </span>
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-4 text-[13px] text-[color:var(--graphite)]">
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
              <Keycap>?</Keycap> charts
            </span>
          </div>

          {played ? (
            <div className="mt-10 border-t border-[color:var(--bone)] pt-6">
              <dl className="flex gap-12">
                <div>
                  <dt className="text-[13px] text-[color:var(--graphite)]">Accuracy</dt>
                  <dd className="text-[40px] font-bold leading-none tracking-[-0.02em] text-[color:var(--ink)]">
                    {accuracy}%
                  </dd>
                </div>
                <div>
                  <dt className="text-[13px] text-[color:var(--graphite)]">Streak</dt>
                  <dd className="text-[40px] font-bold leading-none tracking-[-0.02em] text-[color:var(--ink)]">
                    {stats.currentStreak}
                  </dd>
                </div>
                <div>
                  <dt className="text-[13px] text-[color:var(--graphite)]">Hands</dt>
                  <dd className="text-[40px] font-bold leading-none tracking-[-0.02em] text-[color:var(--ink)]">
                    {stats.totalAnswered}
                  </dd>
                </div>
              </dl>

              <div className="mt-6">
                <p className="text-[13px] text-[color:var(--graphite)]">By position</p>
                <dl className="mt-2 grid grid-cols-5 gap-2">
                  {POSITIONS.map((p) => {
                    const { answered, correct } = stats.byPosition[p]!;
                    const pct = answered > 0 ? Math.round((correct / answered) * 100) : null;
                    return (
                      <div key={p} className="rounded-[3px] bg-[color:var(--paper)] px-2 py-2">
                        <dt className="text-[11px] text-[color:var(--graphite)]">
                          <Tooltip text={GLOSSARY[p]?.tooltip ?? p}>
                            <span className="cursor-help underline decoration-dotted decoration-[color:var(--bone)] underline-offset-4">
                              {p}
                            </span>
                          </Tooltip>
                        </dt>
                        <dd className="mt-1 text-[18px] font-semibold tabular-nums text-[color:var(--ink)]">
                          {pct === null ? "—" : `${pct}%`}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>

              {(() => {
                const leaks = Object.entries(stats.byHand)
                  .filter(([, v]) => v.answered >= 3 && v.correct < v.answered)
                  .sort((a, b) => {
                    const accA = a[1].correct / a[1].answered;
                    const accB = b[1].correct / b[1].answered;
                    if (accA !== accB) return accA - accB;
                    return b[1].answered - b[1].correct - (a[1].answered - a[1].correct);
                  })
                  .slice(0, 5);
                if (leaks.length === 0) return null;
                return (
                  <div className="mt-6">
                    <p className="text-[13px] text-[color:var(--graphite)]">
                      <Tooltip text={GLOSSARY['LEAKS']!.tooltip}>
                        <span className="cursor-help underline decoration-dotted decoration-[color:var(--bone)] underline-offset-4">
                          Leaks
                        </span>
                      </Tooltip>
                    </p>
                    <ul className="mt-2 space-y-1">
                      {leaks.map(([hand, v]) => {
                        const pct = Math.round((v.correct / v.answered) * 100);
                        return (
                          <li key={hand}>
                            <button
                              onClick={onStartLeaks}
                              className="flex w-full items-center justify-between rounded-[3px] bg-[color:var(--paper)] px-3 py-2 text-left text-[14px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)]"
                            >
                              <span className="font-medium text-[color:var(--ink)]">{hand}</span>
                              <span className="tabular-nums text-[color:var(--graphite)]">
                                {v.answered - v.correct} misses of {v.answered}, {pct}%
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })()}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col items-center">
          <div className="poster-in">
            <RangeGrid range={btn} maxWidth={520} />
          </div>
          <p className="mt-3 self-stretch text-[13px] text-[color:var(--graphite)]">
            Button opening range — {rangePercent(btn).toFixed(1)}% of hands
          </p>
        </div>
      </div>
    </main>
  );
}
