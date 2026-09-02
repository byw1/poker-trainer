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

/** Seats in preflop action order, big blind last. */
export type Seat = "UTG" | "MP" | "CO" | "BTN" | "SB" | "BB";
const SEAT_ORDER: Seat[] = ["UTG", "MP", "CO", "BTN", "SB", "BB"];

/**
 * A 6-max table diagram, always hero-centric: `active` sits at the bottom
 * labelled "You", the other five rotate around the oval keeping clockwise
 * order UTG -> MP -> CO -> BTN -> SB -> BB.
 */
export function SeatRing({
  active = "BTN",
  width = 300,
  /** Dim the seats that already folded before the hero. */
  showFolds = true,
}: {
  active?: Seat;
  width?: number;
  showFolds?: boolean;
}) {
  const h = Math.round(width * 0.64);
  const cx = width / 2;
  const cy = h / 2;
  const rx = width / 2 - 34;
  const ry = h / 2 - 24;
  const heroIndex = SEAT_ORDER.indexOf(active);

  return (
    <div className="relative" style={{ width, height: h }}>
      <svg
        width={width}
        height={h}
        viewBox={`0 0 ${width} ${h}`}
        role="img"
        aria-label={`6-max table, you are in the ${active} seat`}
      >
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill="color-mix(in oklch, var(--bone) 35%, transparent)"
          stroke="var(--bone)"
          strokeWidth="1"
        />
      </svg>

      {SEAT_ORDER.map((seat, i) => {
        const step = (i - heroIndex + 6) % 6;
        const a = ((90 - step * 60) * Math.PI) / 180;
        const x = cx + rx * Math.cos(a);
        const y = cy + ry * Math.sin(a);
        const isHero = step === 0;
        const folded = showFolds && !isHero && SEAT_ORDER.indexOf(seat) < heroIndex;

        const style = isHero
          ? { backgroundColor: "var(--ink)", color: "var(--paper)", borderColor: "var(--ink)" }
          : folded
            ? {
                backgroundColor: "color-mix(in oklch, var(--bone) 45%, transparent)",
                color: "var(--graphite)",
                borderColor: "var(--bone)",
              }
            : {
                backgroundColor: "var(--paper)",
                color: "var(--ink)",
                borderColor: "var(--graphite)",
              };

        return (
          <div
            key={seat}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: x, top: y }}
          >
            <Tooltip text={GLOSSARY[seat]?.tooltip ?? seat}>
              <span
                className="flex min-w-[46px] cursor-help flex-col items-center rounded-[3px] border px-2 py-1 text-center leading-tight"
                style={style}
              >
                {isHero ? <span className="text-[10px] font-medium">You</span> : null}
                <span className="text-[12px] font-semibold tracking-[-0.01em]">{seat}</span>
                {folded ? (
                  <span className="text-[9px] text-[color:var(--graphite)]">folded</span>
                ) : null}
              </span>
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
}
