import { useEffect, useState } from "react";
import { RANKS, gridCell, type HandClass } from "@/lib/handClasses";
import type { Range } from "@/lib/rangeParser";

function cellColor(freq: number): string {
  if (freq <= 0) return "var(--bone)";
  return `color-mix(in oklch, var(--crimson) ${Math.round(freq * 100)}%, var(--bone))`;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface Props {
  range: Range;
  highlight?: HandClass;
  /** Ripple the cells outward from the highlighted hand on mount. */
  reveal?: boolean;
  onHoverCell?: (hand: HandClass | null) => void;
}

export function RangeGrid({ range, highlight, reveal = false, onHoverCell }: Props) {
  const [shown, setShown] = useState(!reveal);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (!reveal) return;
    setShown(false);
    const t = window.setTimeout(() => setShown(true), 16);
    return () => window.clearTimeout(t);
  }, [reveal, highlight]);

  let originRow = 6;
  let originCol = 6;
  if (highlight) {
    for (let r = 0; r < 13; r++) {
      for (let c = 0; c < 13; c++) {
        if (gridCell(r, c) === highlight) {
          originRow = r;
          originCol = c;
        }
      }
    }
  }

  return (
    <div
      className="grid w-full max-w-[560px] border border-[color:color-mix(in_oklch,var(--ink)_35%,transparent)]"
      style={{ gridTemplateColumns: "repeat(13, minmax(0, 1fr))" }}
      onMouseLeave={() => onHoverCell?.(null)}
      role="table"
      aria-label="13 by 13 preflop range grid"
    >
      {Array.from({ length: 13 }).map((_, row) =>
        Array.from({ length: 13 }).map((__, col) => {
          const hand = gridCell(row, col);
          const freq = range[hand] ?? 0;
          const isHighlight = hand === highlight;
          const dist = Math.max(Math.abs(row - originRow), Math.abs(col - originCol));
          const delay = reveal && !reduced ? dist * 28 : 0;
          return (
            <div
              key={`${row}-${col}`}
              role="cell"
              title={`${hand} — ${Math.round(freq * 100)}% raise`}
              onMouseEnter={() => onHoverCell?.(hand)}
              className="relative flex aspect-square items-center justify-center border-[0.5px] border-[color:color-mix(in_oklch,var(--ink)_18%,transparent)] text-[9px] leading-none sm:text-[11px]"
              style={{
                backgroundColor: cellColor(freq),
                color:
                  freq > 0.5 ? "var(--paper)" : "color-mix(in oklch, var(--ink) 70%, transparent)",
                opacity: shown ? 1 : 0,
                transform: shown || reduced ? "none" : "scale(0.86)",
                transition: reduced
                  ? "opacity 260ms linear"
                  : `opacity 180ms ease-out ${delay}ms, transform 180ms ease-out ${delay}ms`,
                outline: isHighlight ? "2px solid var(--ink)" : undefined,
                outlineOffset: isHighlight ? "-2px" : undefined,
                zIndex: isHighlight ? 1 : undefined,
                fontWeight: isHighlight ? 700 : 400,
              }}
            >
              {hand}
            </div>
          );
        }),
      )}
    </div>
  );
}

export { RANKS };
