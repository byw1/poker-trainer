import { POSITIONS, type Position } from "@/lib/charts";
import { GLOSSARY } from "@/lib/glossary";
import { Tooltip } from "./Tooltip";

/** A small physical-looking keycap. */
export function Keycap({ children }: { children: React.ReactNode }) {
  return (
    <span
      aria-hidden
      className="inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-[4px] border border-[color:color-mix(in_oklch,var(--ink)_30%,transparent)] px-[5px] text-[11px] font-medium leading-none"
      style={{ backgroundColor: "var(--paper)", color: "var(--ink)" }}
    >
      {children}
    </span>
  );
}

/**
 * Quiet 6-max seat glyph: six seats around an oval, the active one filled.
 */
export function SeatRing({
  active,
  size = 92,
  label = true,
}: {
  active?: Position;
  size?: number;
  label?: boolean;
}) {
  const h = size * 0.52;
  const cx = size / 2;
  const cy = h / 2;
  const rx = size / 2 - 7;
  const ry = h / 2 - 7;
  // Six seats: five named positions plus the big blind, laid out clockwise.
  const seats: (Position | "BB")[] = [...POSITIONS, "BB"];

  return (
    <span className="inline-flex items-center gap-2">
      <svg width={size} height={h} viewBox={`0 0 ${size} ${h}`} role="img" aria-label={active ? `${active} seat at a 6-max table` : "6-max table"}>
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill="none"
          stroke="var(--bone)"
          strokeWidth="1"
        />
        {seats.map((s, i) => {
          const a = -Math.PI / 2 + (i * 2 * Math.PI) / 6;
          const x = cx + rx * Math.cos(a);
          const y = cy + ry * Math.sin(a);
          const on = s === active;
          return (
            <circle
              key={s}
              cx={x}
              cy={y}
              r={on ? 5 : 4}
              fill={on ? "var(--ink)" : "var(--bone)"}
            />
          );
        })}
      </svg>
      {label && active ? (
        <Tooltip text={GLOSSARY[active]?.tooltip ?? active}>
          <span className="cursor-help text-[13px] font-medium text-[color:var(--ink)] underline decoration-dotted decoration-[color:var(--bone)] underline-offset-4">
            {active}
          </span>
        </Tooltip>
      ) : null}
    </span>
  );
}
