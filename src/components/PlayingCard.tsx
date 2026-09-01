import { cn } from "@/lib/utils";

export type PlayingCardRank =
  | "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

export type PlayingCardSuit = "clubs" | "diamonds" | "hearts" | "spades";

export type PlayingCardProps = {
  rank: PlayingCardRank;
  suit: PlayingCardSuit;
  className?: string;
  faceDown?: boolean;
  width?: number;
};

type Pip = { x: number; y: number; flip?: boolean };

const suitPaths: Record<PlayingCardSuit, string> = {
  clubs:
    "M12 2a4.1 4.1 0 0 0-4.1 4.1c0 .93.31 1.79.83 2.48a4.1 4.1 0 1 0 2.9 7.33c-.28 2.2-1.02 3.72-2.43 5.09h5.6c-1.41-1.37-2.15-2.89-2.43-5.09a4.1 4.1 0 1 0 2.9-7.33c.52-.69.83-1.55.83-2.48A4.1 4.1 0 0 0 12 2Z",
  diamonds: "M12 1.5 19.3 12 12 22.5 4.7 12Z",
  hearts:
    "M12 21.4C6.1 15.9 2.6 12.4 2.6 8.6a4.85 4.85 0 0 1 4.85-4.85c1.8 0 3.5.87 4.55 2.33a5.63 5.63 0 0 1 4.55-2.33A4.85 4.85 0 0 1 21.4 8.6c0 3.8-3.5 7.3-9.4 12.8Z",
  spades:
    "M12 1.8C6.9 7.2 3.6 10.3 3.6 13.6a4.35 4.35 0 0 0 7.1 3.36c-.3 1.9-1 3.26-2.35 4.54h7.3c-1.35-1.28-2.05-2.64-2.35-4.54a4.35 4.35 0 0 0 7.1-3.36c0-3.3-3.3-6.4-8.4-11.8Z",
};

const redSuits: ReadonlySet<PlayingCardSuit> = new Set(["diamonds", "hearts"]);

const left = 0;
const center = 50;
const right = 100;

const pipLayouts: Partial<Record<PlayingCardRank, readonly Pip[]>> = {
  "2": [{ x: center, y: 0 }, { x: center, y: 100, flip: true }],
  "3": [{ x: center, y: 0 }, { x: center, y: 50 }, { x: center, y: 100, flip: true }],
  "4": [{ x: left, y: 0 }, { x: right, y: 0 }, { x: left, y: 100, flip: true }, { x: right, y: 100, flip: true }],
  "5": [{ x: left, y: 0 }, { x: right, y: 0 }, { x: center, y: 50 }, { x: left, y: 100, flip: true }, { x: right, y: 100, flip: true }],
  "6": [{ x: left, y: 0 }, { x: right, y: 0 }, { x: left, y: 50 }, { x: right, y: 50 }, { x: left, y: 100, flip: true }, { x: right, y: 100, flip: true }],
  "7": [{ x: left, y: 0 }, { x: right, y: 0 }, { x: center, y: 25 }, { x: left, y: 50 }, { x: right, y: 50 }, { x: left, y: 100, flip: true }, { x: right, y: 100, flip: true }],
  "8": [{ x: left, y: 0 }, { x: right, y: 0 }, { x: center, y: 25 }, { x: left, y: 50 }, { x: right, y: 50 }, { x: center, y: 75, flip: true }, { x: left, y: 100, flip: true }, { x: right, y: 100, flip: true }],
  "9": [{ x: left, y: 0 }, { x: right, y: 0 }, { x: left, y: 33.3 }, { x: right, y: 33.3 }, { x: center, y: 50 }, { x: left, y: 66.7, flip: true }, { x: right, y: 66.7, flip: true }, { x: left, y: 100, flip: true }, { x: right, y: 100, flip: true }],
  "10": [{ x: left, y: 0 }, { x: right, y: 0 }, { x: center, y: 16.7 }, { x: left, y: 33.3 }, { x: right, y: 33.3 }, { x: left, y: 66.7, flip: true }, { x: right, y: 66.7, flip: true }, { x: center, y: 83.3, flip: true }, { x: left, y: 100, flip: true }, { x: right, y: 100, flip: true }],
};

function SuitIcon({ suit, className }: { suit: PlayingCardSuit; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("block", className)} fill="currentColor">
      <path d={suitPaths[suit]} />
    </svg>
  );
}

function CornerIndex({
  rank,
  suit,
  flip,
}: {
  rank: PlayingCardRank;
  suit: PlayingCardSuit;
  flip?: boolean;
}) {
  return (
    <div
      className={cn(
        "absolute flex flex-col items-center leading-none",
        flip ? "bottom-[0.55em] right-[0.55em] rotate-180" : "left-[0.55em] top-[0.55em]",
      )}
    >
      <span className="text-[1.55em] font-semibold tracking-[-0.03em]">{rank}</span>
      <SuitIcon suit={suit} className="mt-[0.1em] size-[1.05em]" />
    </div>
  );
}

export function PlayingCard({ rank, suit, className, faceDown, width = 128 }: PlayingCardProps) {
  const color = redSuits.has(suit) ? "#c22f2f" : "#23262d";
  const pips = pipLayouts[rank];

  return (
    <div
      className={cn(
        "relative aspect-[5/7] select-none overflow-hidden rounded-[0.9em] bg-white",
        className,
      )}
      style={{
        width,
        fontSize: width / 14,
        color,
        boxShadow:
          "0 1px 2px rgba(16, 20, 24, 0.18), 0 12px 24px -12px rgba(16, 20, 24, 0.45)",
      }}
    >
      {faceDown ? (
        <div
          className="absolute inset-0 rounded-[0.9em]"
          style={{
            backgroundColor: "#9d2c35",
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.22) 0 2px, transparent 2px 6px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.22) 0 2px, transparent 2px 6px)",
            boxShadow: "inset 0 0 0 0.35em #9d2c35, inset 0 0 0 0.42em rgba(255,255,255,0.85)",
          }}
        />
      ) : (
        <>
          <CornerIndex rank={rank} suit={suit} />
          <CornerIndex rank={rank} suit={suit} flip />

          <div className="absolute inset-y-[1.1em] left-[2.9em] right-[2.9em]">
            {rank === "A" ? (
              <div className="flex h-full items-center justify-center">
                <SuitIcon suit={suit} className="size-[4.6em]" />
              </div>
            ) : pips ? (
              pips.map((p, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    transform: `translate(-50%, -50%) rotate(${p.flip ? 180 : 0}deg)`,
                  }}
                >
                  <SuitIcon suit={suit} className="size-[1.5em]" />
                </div>
              ))
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-[0.2em] rounded-[0.35em] border border-current/35">
                <span className="text-[2.4em] font-semibold leading-none tracking-[-0.03em]">
                  {rank}
                </span>
                <SuitIcon suit={suit} className="size-[2em]" />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
