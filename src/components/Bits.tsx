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
export const SEAT_ORDER: Seat[] = ["UTG", "MP", "CO", "BTN", "SB", "BB"];

export type IconKey = Seat | "ALL" | "LEAKS";

/**
 * A distinct mark per seat: action order for the early seats, a dealer disc for
 * the button, and half/full discs for the blinds' posted money.
 */
export function SeatIcon({
  kind,
  size = 22,
  tone,
  folded = false,
}: {
  kind: IconKey;
  size?: number;
  /** Stroke/fill colour; defaults to currentColor. */
  tone?: string;
  folded?: boolean;
}) {
  const c = tone ?? "currentColor";
  const s = size;
  const body = () => {
    switch (kind) {
      case "UTG":
      case "MP":
      case "CO": {
        const n = kind === "UTG" ? "1" : kind === "MP" ? "2" : "3";
        return (
          <>
            <rect
              x="2.5"
              y="4.5"
              width="19"
              height="15"
              rx="4"
              fill="none"
              stroke={c}
              strokeWidth="1.4"
            />
            <text
              x="12"
              y="16.4"
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill={c}
              fontFamily="inherit"
            >
              {n}
            </text>
          </>
        );
      }
      case "BTN":
        return (
          <>
            <circle cx="12" cy="12" r="8.5" fill="none" stroke={c} strokeWidth="1.4" />
            <text
              x="12"
              y="16.2"
              textAnchor="middle"
              fontSize="10.5"
              fontWeight="700"
              fill={c}
              fontFamily="inherit"
            >
              D
            </text>
          </>
        );
      case "SB":
        return (
          <>
            <circle cx="12" cy="12" r="8.5" fill="none" stroke={c} strokeWidth="1.4" />
            <path d="M12 3.5 A8.5 8.5 0 0 1 12 20.5 Z" fill={c} />
          </>
        );
      case "BB":
        return <circle cx="12" cy="12" r="8.5" fill={c} />;
      case "LEAKS":
        return (
          <>
            <circle cx="12" cy="12" r="7" fill="none" stroke={c} strokeWidth="1.4" />
            <circle cx="12" cy="12" r="2" fill={c} />
            <path
              d="M12 1.5v3.5M12 19v3.5M1.5 12H5M19 12h3.5"
              stroke={c}
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </>
        );
      case "ALL":
      default:
        return (
          <>
            <ellipse cx="12" cy="12" rx="9.5" ry="6" fill="none" stroke={c} strokeWidth="1.4" />
            <circle cx="12" cy="18.2" r="1.7" fill={c} />
            <circle cx="4" cy="12" r="1.4" fill={c} />
            <circle cx="20" cy="12" r="1.4" fill={c} />
          </>
        );
    }
  };

  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      aria-hidden
      style={{ opacity: folded ? 0.35 : 1, display: "block" }}
    >
      {body()}
      {folded ? (
        <path d="M4 12 L20 12" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      ) : null}
    </svg>
  );
}

/** Tiny six-seat glyph used inside hover cards, with one seat filled. */
export function MiniSeats({ active }: { active?: string }) {
  const w = 76;
  const h = 40;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <ellipse
        cx={w / 2}
        cy={h / 2}
        rx={w / 2 - 7}
        ry={h / 2 - 6}
        fill="none"
        stroke="var(--bone)"
        strokeWidth="1"
      />
      {SEAT_ORDER.map((seat, i) => {
        const a = ((90 - i * 60) * Math.PI) / 180;
        const x = w / 2 + (w / 2 - 7) * Math.cos(a);
        const y = h / 2 + (h / 2 - 6) * Math.sin(a);
        const on = seat === active;
        return (
          <circle
            key={seat}
            cx={x}
            cy={y}
            r={on ? 4.2 : 3}
            fill={on ? "var(--spruce)" : "var(--bone)"}
          />
        );
      })}
    </svg>
  );
}

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
          ? {
              backgroundColor: "var(--paper)",
              color: "var(--ink)",
              borderColor: "var(--spruce)",
              boxShadow: "0 0 0 2px color-mix(in oklch, var(--spruce) 35%, transparent)",
            }
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
            className="seat-slide absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: x, top: y }}
          >
            <Tooltip
              title={GLOSSARY[seat]?.title ?? seat}
              text={GLOSSARY[seat]?.tooltip ?? seat}
              seat={seat}
            >
              <span
                className="seat-chip flex min-w-[52px] cursor-help flex-col items-center gap-0.5 rounded-[4px] border px-2 py-1 text-center leading-tight"
                style={style}
              >
                <SeatIcon kind={seat} size={20} folded={folded} />
                {isHero ? (
                  <span className="text-[10px] font-medium text-[color:var(--spruce)]">You</span>
                ) : null}
                <span className="text-[12px] font-semibold tracking-[-0.01em]">{seat}</span>
              </span>
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
}
