import { useState } from "react";
import { RangeGrid } from "./RangeGrid";
import { CHARTS, POSITIONS, POSITION_LABEL, type Position } from "@/lib/charts";
import { rangePercent } from "@/lib/rangeParser";
import type { HandClass } from "@/lib/handClasses";
import { GLOSSARY } from "@/lib/glossary";
import { Tooltip } from "./Tooltip";
import { SeatIcon } from "./Bits";

interface Props {
  initialPosition?: Position;
  onBack: () => void;
}

export function ChartViewer({ initialPosition = "UTG", onBack }: Props) {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [hover, setHover] = useState<HandClass | null>(null);
  const range = CHARTS[position];
  const pct = rangePercent(range);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[860px] flex-col px-6 py-8">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-[13px] text-[color:var(--graphite)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)]"
        >
          Back
        </button>
        <span className="text-[13px] text-[color:var(--graphite)]">
          {POSITION_LABEL[position]} raises {pct.toFixed(1)}% of hands first in.
        </span>
      </div>

      <h1 className="mt-6 text-[26px] font-bold tracking-[-0.02em] text-[color:var(--ink)]">
        Opening ranges, 6-max cash
      </h1>

      <div
        role="group"
        aria-label="Position"
        className="mt-5 inline-flex self-start overflow-hidden rounded-[3px] border border-[color:var(--bone)]"
      >
        {POSITIONS.map((p) => (
          <Tooltip
            key={p}
            title={GLOSSARY[p]?.title ?? p}
            text={GLOSSARY[p]?.tooltip ?? p}
            seat={p}
            focusable={false}
            toggleOnClick={false}
            infoMark
          >
          <button
            onClick={() => setPosition(p)}
            aria-pressed={p === position}
            className="inline-flex items-center gap-1.5 border-r border-[color:var(--bone)] px-5 py-2 text-[14px] font-medium last:border-r-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[color:var(--ink)]"
            style={
              p === position
                ? { backgroundColor: "var(--ink)", color: "var(--paper)" }
                : { color: "var(--ink)" }
            }
          >
            <SeatIcon kind={p} size={16} />
            {p}
          </button>
          </Tooltip>
        ))}
      </div>

      <p className="mt-3 text-[13px] text-[color:var(--graphite)]">
        {GLOSSARY[position]?.caption} Opens {pct.toFixed(1)}% first in.
      </p>

      <div className="mt-6 flex flex-col items-center">
        <RangeGrid range={range} maxWidth={760} onHoverCell={setHover} />
        <p className="mt-3 self-stretch text-[13px] text-[color:var(--graphite)]">
          {hover
            ? `${hover} — ${Math.round((range[hover] ?? 0) * 100)}% raise`
            : "Hover a cell for its raise frequency."}
        </p>
      </div>
    </main>
  );
}
