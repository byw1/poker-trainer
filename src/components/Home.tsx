import type { Stats } from "@/lib/storage";
import { RangeGrid } from "./RangeGrid";
import { Keycap, SeatRing, SeatIcon } from "./Bits";
import { CHARTS, POSITIONS } from "@/lib/charts";
import { rangePercent } from "@/lib/rangeParser";
import { todayKey } from "@/lib/daily";
import { GLOSSARY } from "@/lib/glossary";
import { Tooltip } from "./Tooltip";
import { BADGES, rankFor } from "@/lib/progress";
import { Ticker } from "./Ticker";
import { Button } from "./ui/Button";
import { Logo, LogoMark } from "./Logo";
import { useState } from "react";
import { useDisplay } from "@/lib/display";
import { DisplaySheet } from "./DisplaySheet";


interface Props {
  stats: Stats;
  onStart: () => void;
  onDaily: () => void;
  onStartLeaks: () => void;
  onChart: () => void;
  onGlossary: () => void;
}

export function Home({ stats, onStart, onDaily, onStartLeaks, onChart, onGlossary }: Props) {
  const today = todayKey();
  const todayBest = stats.dailyBest?.[today];
  const played = stats.totalAnswered > 0;
  const accuracy = played ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) : 0;
  const btn = CHARTS.BTN;
  const { rank, next, progress } = rankFor(stats.xp);
  const { display, set: setDisplay } = useDisplay();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1120px] flex-col justify-center px-4 py-10 sm:px-6 sm:py-16">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
        <div className="mx-auto flex w-full max-w-[440px] min-w-0 flex-col items-center text-center lg:mx-0 lg:block lg:max-w-none lg:text-left">
          <div className="order-1 mb-3 lg:mb-4">
            <span className="lg:hidden">
              <Logo size={56} wordmark={false} />
            </span>
            <span className="hidden lg:inline-flex">
              <LogoMark size={40} />
            </span>
          </div>

          <h1 className="order-1 text-[34px] font-bold leading-[1.02] tracking-[-0.03em] text-[color:var(--ink)] sm:text-[44px]">
            Poker Trainer
          </h1>

          <p className="order-2 mt-1 text-[15px] font-medium text-[color:var(--spruce)]">
            Open. Or don&rsquo;t.
          </p>

          <div className="order-4 mt-6 flex flex-col items-center lg:order-none lg:mt-4 lg:items-start">
            {display.table ? (
              <>
                <SeatRing active="BTN" width={300} showFolds={false} hoverHelp={display.hoverHelp} />
                <p className="mt-2 text-[13px] text-[color:var(--graphite)]">
                  You are on the button. Seats go clockwise.
                </p>
              </>
            ) : null}
          </div>

          <p className="order-2 mt-4 max-w-[40ch] text-[15px] text-[color:var(--graphite)] sm:text-[16px]">
            Preflop open-raise drills for 6-max cash. Get a hand, fold or raise, see the range.
          </p>

          <div className="order-3 mt-6 flex w-full flex-col items-center gap-3 sm:mt-8 lg:items-start">
            <Button
              variant="primary"
              size="xl"
              className="mx-auto min-h-[48px] w-full max-w-[320px] lg:mx-0 lg:w-auto"
              onClick={onStart}
            >
              Start drill
            </Button>
            <div className="mx-auto grid w-full max-w-[320px] grid-cols-2 gap-2 lg:mx-0 lg:flex lg:max-w-none lg:gap-3">
              <Button variant="outline" className="min-h-[44px] w-full rounded-full px-2 text-[13px] lg:w-auto lg:px-5 lg:text-[15px]" onClick={onDaily}>
                Today&rsquo;s 10
              </Button>
              <Button variant="secondary" className="min-h-[44px] w-full rounded-full px-2 text-[13px] lg:w-auto lg:px-5 lg:text-[15px]" onClick={onChart}>
                Charts
              </Button>
            </div>
            <button
              onClick={() => setSheetOpen(true)}
              className="mx-auto inline-flex min-h-[44px] items-center gap-1.5 text-[13px] text-[color:var(--graphite)] underline underline-offset-4 lg:mx-0"
            >
              Display &amp; glossary
            </button>
          </div>



          {typeof todayBest === "number" ? (
            <p className="order-5 mt-4 text-[13px] text-[color:var(--graphite)] lg:order-none">
              Today&rsquo;s best{" "}
              <span className="text-[15px] font-bold tabular-nums text-[color:var(--ink)]">
                {todayBest}/10
              </span>
            </p>
          ) : null}

          <div className="order-5 mt-6 flex flex-wrap items-center gap-4 text-[13px] text-[color:var(--graphite)] lg:order-none">
            <span className="inline-flex items-center gap-2">
              <Keycap>F</Keycap>
              <Tooltip enabled={display.hoverHelp} title={GLOSSARY['FOLD']!.title} text={GLOSSARY['FOLD']!.tooltip}>
                <span className="cursor-help">fold</span>
              </Tooltip>
            </span>
            <span className="inline-flex items-center gap-2">
              <Keycap>C</Keycap>
              <Tooltip enabled={display.hoverHelp} title={GLOSSARY['CALL']!.title} text={GLOSSARY['CALL']!.tooltip}>
                <span className="cursor-help">call</span>
              </Tooltip>
            </span>
            <span className="inline-flex items-center gap-2">
              <Keycap>R</Keycap>
              <Tooltip enabled={display.hoverHelp} title={GLOSSARY['RAISE']!.title} text={GLOSSARY['RAISE']!.tooltip}>
                <span className="cursor-help">raise</span>
              </Tooltip>
            </span>
            <span className="inline-flex items-center gap-2">
              <Keycap>?</Keycap> charts
            </span>
          </div>

          {played ? (
            <div className="order-5 mt-6 flex flex-wrap items-center gap-2 lg:order-none">
              <span
                className="pill"
                style={{ borderColor: "var(--spruce)", color: "var(--spruce)" }}
                title={next ? `${next.min - stats.xp} XP to ${next.name}` : "Top rank"}
              >
                {rank.name} · <Ticker value={stats.xp} /> XP
                <span
                  aria-hidden
                  className="ml-1 inline-block h-1.5 w-10 rounded-[1px]"
                  style={{ backgroundColor: "var(--bone)" }}
                >
                  <span
                    className="meter-fill block h-full rounded-[1px]"
                    style={{
                      width: `${Math.round(progress * 100)}%`,
                      backgroundColor: "var(--spruce)",
                    }}
                  />
                </span>
              </span>
              {stats.badges.map((b) => (
                <span key={b} className="chip" title={BADGES[b]?.hint}>
                  {BADGES[b]?.label ?? b}
                </span>
              ))}
            </div>
          ) : null}

          {played ? (
            <div className="order-5 mt-10 border-t border-[color:var(--bone)] pt-6 lg:order-none">
              <dl className="grid grid-cols-3 gap-4 sm:flex sm:gap-12">
                <div>
                  <dt className="text-[13px] text-[color:var(--graphite)]">Accuracy</dt>
                  <dd className="text-[28px] font-bold leading-none tracking-[-0.02em] text-[color:var(--ink)] sm:text-[40px]">
                    {accuracy}%
                  </dd>
                </div>
                <div>
                  <dt className="text-[13px] text-[color:var(--graphite)]">Streak</dt>
                  <dd className="text-[28px] font-bold leading-none tracking-[-0.02em] text-[color:var(--ink)] sm:text-[40px]">
                    {stats.currentStreak}
                  </dd>
                </div>
                <div>
                  <dt className="text-[13px] text-[color:var(--graphite)]">Hands</dt>
                  <dd className="text-[28px] font-bold leading-none tracking-[-0.02em] text-[color:var(--ink)] sm:text-[40px]">
                    {stats.totalAnswered}
                  </dd>
                </div>
              </dl>

              <div className="mt-6">
                <p className="text-[13px] text-[color:var(--graphite)]">By position</p>
                <dl className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {POSITIONS.map((p) => {
                    const { answered, correct } = stats.byPosition[p]!;
                    const pct = answered > 0 ? Math.round((correct / answered) * 100) : null;
                    return (
                      <div key={p} className="rounded-[3px] bg-[color:var(--paper)] px-2 py-2">
                        <dt className="text-[11px] text-[color:var(--graphite)]">
                          <Tooltip enabled={display.hoverHelp}
                            title={GLOSSARY[p]?.title ?? p}
                            text={GLOSSARY[p]?.tooltip ?? p}
                            seat={p}
                          >
                            <span className="inline-flex cursor-help items-center gap-1 underline decoration-dotted decoration-[color:var(--bone)] underline-offset-4">
                              <SeatIcon kind={p} size={14} />
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
                      <Tooltip enabled={display.hoverHelp} title={GLOSSARY['LEAKS']!.title} text={GLOSSARY['LEAKS']!.tooltip}>
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
                              className="flex min-h-[44px] w-full flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-[3px] bg-[color:var(--paper)] px-3 py-2 text-left text-[14px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)]"
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

        <div className="order-last mx-auto flex w-full max-w-[440px] min-w-0 flex-col items-center lg:max-w-none">
          <div className="poster-in w-full">
            <RangeGrid range={btn} maxWidth={520} />
          </div>
          <p className="mt-3 self-stretch text-center text-[13px] lg:text-left text-[color:var(--graphite)]">
            Button opening range — {rangePercent(btn).toFixed(1)}% of hands
          </p>
        </div>
      </div>

      {sheetOpen ? (
        <DisplaySheet
          display={display}
          onChange={setDisplay}
          onClose={() => setSheetOpen(false)}
          links={[{ label: "Glossary", onClick: () => { setSheetOpen(false); onGlossary(); } }]}
        />
      ) : null}
    </main>
  );
}
