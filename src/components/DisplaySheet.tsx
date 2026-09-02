import { useEffect } from "react";
import type { DisplaySettings } from "@/lib/display";

interface Row {
  key: keyof DisplaySettings;
  label: string;
  hint: string;
}

const ROWS: Row[] = [
  { key: "table", label: "Table diagram", hint: "Six-max seat ring above the cards" },
  { key: "captions", label: "Seat captions", hint: "One-line explainer under the mode tabs" },
  { key: "hoverHelp", label: "Hover help", hint: "Glossary cards on hover (desktop only)" },
  { key: "insight", label: "GTO card after you act", hint: "Open % and equity for the hand" },
  { key: "rangeAfter", label: "Range grid after you act", hint: "13×13 chart with your hand marked" },
  { key: "sound", label: "Sound", hint: "Deal, flip, and verdict ticks" },
];

interface Props {
  display: DisplaySettings;
  onChange: (patch: Partial<DisplaySettings>) => void;
  onClose: () => void;
  /** Extra text links shown at the bottom of the sheet. */
  links?: { label: string; onClick: () => void }[];
}

export function DisplaySheet({ display, onChange, onClose, links = [] }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        aria-label="Close display settings"
        onClick={onClose}
        className="absolute inset-0"
        style={{ backgroundColor: "color-mix(in oklch, var(--ink) 28%, transparent)" }}
      />
      <div
        role="dialog"
        aria-label="Display settings"
        className="relative w-full max-w-[440px] rounded-t-[12px] border px-4 pt-4 sm:rounded-[12px]"
        style={{
          backgroundColor: "var(--paper)",
          borderColor: "var(--bone)",
          paddingBottom: "calc(16px + env(safe-area-inset-bottom))",
        }}
      >
        <div className="flex items-center justify-between">
          <p className="text-[17px] font-bold tracking-[-0.02em] text-[color:var(--ink)]">Display</p>
          <button
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-11 w-11 items-center justify-center text-[color:var(--graphite)]"
          >
            ✕
          </button>
        </div>

        <ul className="mt-2 divide-y" style={{ borderColor: "var(--bone)" }}>
          {ROWS.map((r) => {
            const on = display[r.key];
            return (
              <li key={r.key}>
                <button
                  role="switch"
                  aria-checked={on}
                  onClick={() => onChange({ [r.key]: !on } as Partial<DisplaySettings>)}
                  className="flex min-h-[52px] w-full items-center justify-between gap-4 py-2 text-left"
                >
                  <span className="min-w-0">
                    <span className="block text-[15px] font-medium text-[color:var(--ink)]">
                      {r.label}
                    </span>
                    <span className="block text-[12px] text-[color:var(--graphite)]">{r.hint}</span>
                  </span>
                  <span
                    aria-hidden
                    className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
                    style={{ backgroundColor: on ? "var(--spruce)" : "var(--bone)" }}
                  >
                    <span
                      className="absolute top-[3px] h-[18px] w-[18px] rounded-full transition-all"
                      style={{ left: on ? 20 : 3, backgroundColor: "var(--paper)" }}
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {links.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-4 border-t pt-3" style={{ borderColor: "var(--bone)" }}>
            {links.map((l) => (
              <button
                key={l.label}
                onClick={l.onClick}
                className="min-h-[44px] text-[14px] text-[color:var(--ink)] underline underline-offset-4"
              >
                {l.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
