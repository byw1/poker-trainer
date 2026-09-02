type Tone = "neutral" | "green" | "red" | "ink";

const TONES: Record<Tone, { bg: string; fg: string; ring: string }> = {
  neutral: {
    bg: "var(--paper)",
    fg: "var(--graphite)",
    ring: "0 0 0 1px var(--bone)",
  },
  green: {
    bg: "color-mix(in oklch, var(--spruce) 10%, var(--paper))",
    fg: "var(--spruce)",
    ring: "0 0 0 1px color-mix(in oklch, var(--spruce) 28%, transparent)",
  },
  red: {
    bg: "color-mix(in oklch, var(--crimson) 10%, var(--paper))",
    fg: "var(--crimson)",
    ring: "0 0 0 1px color-mix(in oklch, var(--crimson) 28%, transparent)",
  },
  ink: {
    bg: "color-mix(in oklch, var(--ink) 6%, var(--paper))",
    fg: "var(--ink)",
    ring: "0 0 0 1px var(--bone)",
  },
};

/** Inline numeric badge — a value set off in prose. Never a verdict. */
export function ValuePill({
  children,
  tone = "neutral",
  className = "",
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const t = TONES[tone];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-[3px] align-middle text-[12px] font-medium tabular-nums ${className}`}
      style={{ backgroundColor: t.bg, color: t.fg, boxShadow: t.ring }}
    >
      {children}
    </span>
  );
}
