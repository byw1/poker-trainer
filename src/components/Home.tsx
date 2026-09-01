import type { Stats } from "@/lib/storage";

interface Props {
  stats: Stats;
  onStart: () => void;
  onChart: () => void;
}

export function Home({ stats, onStart, onChart }: Props) {
  const played = stats.totalAnswered > 0;
  const accuracy = played ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) : 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[560px] flex-col justify-center px-6 py-16">
      <h1 className="text-[34px] font-bold tracking-[-0.02em] text-[color:var(--ink)]">
        Poker Trainer
      </h1>
      <p className="mt-3 max-w-[42ch] text-[15px] text-[color:var(--graphite)]">
        Drill preflop open-raise decisions for 6-max cash games. You get a hand and a position, you
        fold or raise, and you find out why.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <button
          onClick={onStart}
          className="rounded-[3px] bg-[color:var(--spruce)] px-6 py-3 text-[15px] font-medium text-[color:var(--paper)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)]"
        >
          Start drill
        </button>
        <button
          onClick={onChart}
          className="rounded-[3px] border border-[color:var(--bone)] px-6 py-3 text-[15px] font-medium text-[color:var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)]"
        >
          View charts
        </button>
      </div>

      {played ? (
        <dl className="mt-12 flex gap-10 border-t border-[color:var(--bone)] pt-6">
          <div>
            <dt className="text-[13px] text-[color:var(--graphite)]">Accuracy</dt>
            <dd className="text-[24px] font-medium text-[color:var(--ink)]">{accuracy}%</dd>
          </div>
          <div>
            <dt className="text-[13px] text-[color:var(--graphite)]">Streak</dt>
            <dd className="text-[24px] font-medium text-[color:var(--ink)]">
              {stats.currentStreak}
            </dd>
          </div>
          <div>
            <dt className="text-[13px] text-[color:var(--graphite)]">Hands</dt>
            <dd className="text-[24px] font-medium text-[color:var(--ink)]">
              {stats.totalAnswered}
            </dd>
          </div>
        </dl>
      ) : null}
    </main>
  );
}
