import { useEffect, useId, useRef, useState } from "react";

interface Props {
  /** Tooltip body text. */
  text: string;
  children: React.ReactNode;
  /** Extra classes on the trigger wrapper. */
  className?: string;
  /** When false the wrapper is not focusable (the child already is). */
  focusable?: boolean;
}

/**
 * Quiet paper tooltip: hover (200ms delay) and focus on desktop,
 * tap to toggle on touch, tap elsewhere to dismiss.
 */
export function Tooltip({ text, children, className, focusable = true }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const id = useId();

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  useEffect(() => clear, []);

  // Fixed positioning so the tooltip escapes clipped/overflow-hidden containers.
  useEffect(() => {
    if (!open) return;
    const r = ref.current?.getBoundingClientRect();
    if (r) setPos({ left: r.left + r.width / 2, top: r.bottom + 8 });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span
      ref={ref}
      className={`relative inline-flex ${className ?? ""}`}
      tabIndex={focusable ? 0 : undefined}
      aria-describedby={open ? id : undefined}
      onMouseEnter={() => {
        clear();
        timer.current = setTimeout(() => setOpen(true), 200);
      }}
      onMouseLeave={() => {
        clear();
        setOpen(false);
      }}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onClick={() => setOpen((v) => !v)}
    >
      {children}
      {open ? (
        <span
          id={id}
          role="tooltip"
          className="fixed z-50 w-[240px] -translate-x-1/2 rounded-[3px] border px-3 py-2 text-left text-[12px] leading-[1.4] font-normal normal-case"
          style={{
            left: pos.left,
            top: pos.top,
            backgroundColor: "var(--paper)",
            borderColor: "var(--bone)",
            color: "var(--ink)",
          }}
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}
