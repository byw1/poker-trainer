import { useState } from "react";
import { RangeGrid } from "./RangeGrid";
import { CHARTS, POSITIONS, POSITION_LABEL, type Position } from "@/lib/charts";
import { rangePercent } from "@/lib/rangeParser";
import type { HandClass } from "@/lib/handClasses";

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
    <main className="mx-auto flex min-h-screen w-full max-w-[640px] flex-col px-6 py-8">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-[13px] text-[color:var(--graphite)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)]"
        >
          Back
        </button>
        <span className="text-[13px] text-[color:var(--graphite)]">
          {hover ? `${hover} — ${Math.round((range[hover] ?? 0) * 100)}% raise` : "\u00A0"}
        </span>
      </div>

      <h1 className="mt-8 text-[24px] font-bold text-[color:var(--ink)]">
        Opening ranges, 6-max cash
      </h1>

      <div className="mt-5 flex flex-wrap gap-2">
        {POSITIONS.map((p) => (
          <button
            key={p}
            onClick={() => setPosition(p)}
            aria-pressed={p === position}
            className="rounded-[3px] border px-4 py-2 text-[14px] font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)]"
            style={
              p === position
                ? {
                    backgroundColor: "var(--ink)",
                    color: "var(--paper)",
                    borderColor: "var(--ink)",
                  }
                : { borderColor: "var(--bone)", color: "var(--ink)" }
            }
          >
            {p}
          </button>
        ))}
      </div>

      <p className="mt-5 text-[14px] text-[color:var(--graphite)]">
        {POSITION_LABEL[position]} raises {pct.toFixed(1)}% of hands first in.
      </p>

      <div className="mt-6 flex justify-center">
        <RangeGrid range={range} onHoverCell={setHover} />
      </div>
    </main>
  );
}
