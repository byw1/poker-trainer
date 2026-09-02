import { Ticker } from "./Ticker";
import { ValuePill } from "./ui/ValuePill";
import { ThinkingTrace } from "./ui/ThinkingTrace";
import { equityVsRandom } from "@/lib/equityVsRandom";
import { combos } from "@/lib/handClasses";
import { CHARTS, POSITION_LABEL, type Position } from "@/lib/charts";
import { rangePercent } from "@/lib/rangeParser";
import type { Action } from "@/drills/types";

function Meter({ value }: { value: number }) {
  return (
    <span className="mt-2 block h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--bone)]">
      <span
        className="meter-fill block h-full"
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          backgroundColor: "var(--crimson)",
        }}
      />
    </span>
  );
}

function Stat({
  label,
  pill,
  children,
  meter,
}: {
  label: string;
  pill?: React.ReactNode;
  children: React.ReactNode;
  meter?: number;
}) {
  return (
    <div className="min-w-0 flex-1">
      <p className="text-[12px] text-[color:var(--graphite)]">{label}</p>
      <p className="mt-1 flex items-baseline gap-2 text-[24px] font-bold leading-none sm:text-[28px] tracking-[-0.02em] text-[color:var(--ink)]">
        {children}
      </p>
      {pill ? <span className="mt-2 inline-flex">{pill}</span> : null}
      {typeof meter === "number" ? <Meter value={meter} /> : null}
    </div>
  );
}

/** Recommendation-card style teaching panel: headline, value pills, trace. */
export function InsightCard({
  hand,
  position,
  chosen,
}: {
  hand: string;
  position: Position;
  chosen: Action;
}) {
  const range = CHARTS[position];
  const openFreq = Math.round((range[hand] ?? 0) * 100);
  const equity = equityVsRandom(hand);
  const n = combos(hand);
  const seatPct = rangePercent(range).toFixed(1);
  const label = POSITION_LABEL[position];
  const says = openFreq >= 50 ? "raise" : "fold";

  return (
    <div className="insight-in mt-6 w-full min-w-0 max-w-[520px] rounded-[12px] border border-[color:var(--bone)] bg-[color:var(--paper)] p-4 text-left sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-[17px] font-bold tracking-[-0.01em] text-[color:var(--ink)]">
          GTO says {says}
        </h2>
        <ValuePill tone={says === "raise" ? "green" : "red"}>{openFreq}% open</ValuePill>
        <ValuePill tone="ink">{equity.toFixed(1)}% vs random</ValuePill>
        <ValuePill tone="neutral">{n} combos</ValuePill>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:flex sm:gap-5">
        <Stat label={`GTO open from ${position}`} meter={openFreq}>
          <Ticker value={openFreq} suffix="%" />
        </Stat>
        <Stat label="Wins vs a random hand" meter={equity}>
          <Ticker value={equity} decimals={1} suffix="%" />
        </Stat>
        <Stat label="Combos">
          <Ticker value={n} />
        </Stat>
      </div>

      {chosen === "call" ? (
        <p className="mt-4 text-[13px] text-[color:var(--graphite)]">
          This seat&rsquo;s GTO mix is raise-or-fold — limp frequency is 0% in this trainer.
        </p>
      ) : null}

      <ThinkingTrace
        steps={[
          `Folded to you from ${label.toLowerCase()}.`,
          `${position} opens ~${seatPct}% of hands first in.`,
          `${hand} is ${openFreq >= 50 ? "inside" : "outside"} that range.`,
        ]}
      />
    </div>
  );
}
