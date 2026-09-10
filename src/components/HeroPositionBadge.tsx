import { SeatIcon } from "./Bits";
import { GLOSSARY } from "@/lib/glossary";
import type { Position } from "@/lib/charts";

/** Always-on hero seat cue near the hole cards (independent of Display table). */
export function HeroPositionBadge({ position }: { position: Position }) {
  return (
    <div className="mt-2 flex flex-col items-center gap-0.5 sm:mt-3">
      <span
        className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[13px] font-semibold text-[color:var(--ink)]"
        style={{ borderColor: "var(--bone)", backgroundColor: "var(--paper)" }}
      >
        <SeatIcon kind={position} size={16} />
        You · {position}
      </span>
      <span className="max-w-[220px] truncate text-center text-[11px] text-[color:var(--graphite)] sm:hidden">
        {GLOSSARY[position]?.title ?? position}
      </span>
      <span className="hidden max-w-[280px] text-center text-[12px] text-[color:var(--graphite)] sm:block">
        {GLOSSARY[position]?.caption ?? GLOSSARY[position]?.tooltip ?? ""}
      </span>
    </div>
  );
}
