/**
 * Brand mark: two overlapping 5:7 playing cards, fanned 8deg.
 * Back card is ink with a spade, front is paper with a crimson diamond.
 */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      role="img"
      aria-label="Poker Trainer"
      className="shrink-0"
    >
      <g transform="rotate(-8 18 20)">
        <rect
          x="6.5"
          y="5"
          width="15"
          height="21"
          rx="2.5"
          fill="var(--ink)"
          stroke="var(--ink)"
          strokeWidth="1"
        />
        {/* spade */}
        <path
          d="M14 11.5c-2 2.2-3.6 3.3-3.6 5a2.1 2.1 0 0 0 3.1 1.8c-.1 1-.5 1.7-1.1 2.2h3.2c-.6-.5-1-1.2-1.1-2.2a2.1 2.1 0 0 0 3.1-1.8c0-1.7-1.6-2.8-3.6-5Z"
          fill="var(--paper)"
        />
      </g>
      <g transform="rotate(8 18 20)">
        <rect
          x="14.5"
          y="8"
          width="15"
          height="21"
          rx="2.5"
          fill="var(--paper)"
          stroke="var(--ink)"
          strokeWidth="1.2"
        />
        {/* diamond */}
        <path d="M22 13.2 25.6 18.5 22 23.8 18.4 18.5Z" fill="var(--crimson)" />
      </g>
    </svg>
  );
}

export function Logo({
  size = 36,
  className = "",
  wordmark = true,
}: {
  size?: number;
  className?: string;
  wordmark?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      {wordmark ? (
        <span
          className="font-bold tracking-[-0.03em] text-[color:var(--ink)]"
          style={{ fontSize: Math.round(size * 0.52) }}
        >
          Poker Trainer
        </span>
      ) : null}
    </span>
  );
}
