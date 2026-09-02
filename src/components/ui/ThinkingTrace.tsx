import { useState } from "react";

/** "Thought for a beat" — height-animated expandable reasoning trace. */
export function ThinkingTrace({
  label = "Thought for a beat",
  steps,
}: {
  label?: string;
  steps: React.ReactNode[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 text-[13px] text-[color:var(--graphite)] transition-colors duration-150 ease-out hover:text-[color:var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)]"
      >
        <span className="trace-caret" data-open={open ? "true" : "false"} aria-hidden>
          ›
        </span>
        {label}
      </button>
      <div className="trace-collapse" data-open={open ? "true" : "false"} aria-hidden={!open}>
        <div className="min-h-0 overflow-hidden">
          <ol className="space-y-1 pt-2 text-[13px] text-[color:var(--graphite)]">
            {steps.map((s, i) => (
              <li key={i}>
                {i + 1}. {s}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
