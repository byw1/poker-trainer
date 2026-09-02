import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MiniSeats } from "./Bits";

interface Props {
  /** Body copy, one sentence. */
  text: string;
  /** Full name shown as the card title, e.g. "Under the gun". */
  title?: string | undefined;
  /** Seat to highlight in the mini table glyph. */
  seat?: string | undefined;
  children: React.ReactNode;
  /** Extra classes on the trigger wrapper. */
  className?: string;
  /** When false the wrapper is not focusable (the child already is). */
  focusable?: boolean;
  /** Set false (display setting "Hover help") to render children only. */
  enabled?: boolean;
}

const OPEN_DELAY = 280;
const CLOSE_DELAY = 120;
const CARD_W = 280;
const PAD = 12;

/** True only on devices with a real hover-capable pointer. */
function useHoverCapable() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const read = () => setOk(mq.matches);
    read();
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, []);
  return ok;
}

/**
 * Glossary hover card. Desktop-only (hover: hover), portalled to document.body,
 * measured before it is painted so it never flashes at 0,0.
 */
export function Tooltip({
  text,
  title,
  seat,
  children,
  className,
  focusable = true,
  enabled = true,
}: Props) {
  const hoverCapable = useHoverCapable();
  const active = enabled && hoverCapable;

  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLSpanElement>(null);
  const id = useId();

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const schedule = useCallback(
    (next: boolean) => {
      clear();
      if (!active && next) return;
      timer.current = setTimeout(() => {
        if (!next) setPos(null);
        setOpen(next);
      }, next ? OPEN_DELAY : CLOSE_DELAY);
    },
    [active],
  );

  useEffect(() => clear, []);

  useEffect(() => {
    if (!active && open) {
      setOpen(false);
      setPos(null);
    }
  }, [active, open]);

  // Measure, clamp inside the viewport, flip above when it would run off-screen.
  useEffect(() => {
    if (!open) return;
    const place = () => {
      const r = ref.current?.getBoundingClientRect();
      const card = cardRef.current;
      if (!r || !card) return;
      const cw = card.offsetWidth;
      const ch = card.offsetHeight;
      const below = r.bottom + 10;
      const flipped = below + ch > window.innerHeight - PAD;
      const left = Math.max(
        PAD,
        Math.min(r.left + r.width / 2 - cw / 2, window.innerWidth - cw - PAD),
      );
      const top = Math.max(
        PAD,
        Math.min(flipped ? r.top - 10 - ch : below, window.innerHeight - ch - PAD),
      );
      setPos({ left, top });
    };
    const raf = requestAnimationFrame(place);
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!ref.current?.contains(t) && !cardRef.current?.contains(t)) {
        setOpen(false);
        setPos(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setPos(null);
      }
    };
    document.addEventListener("pointerdown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!active) return <>{children}</>;

  const card =
    open && typeof document !== "undefined"
      ? createPortal(
          <span
            ref={cardRef}
            id={id}
            role="tooltip"
            onMouseEnter={clear}
            onMouseLeave={() => schedule(false)}
            className="hover-card fixed z-50 flex flex-col gap-1.5 rounded-[8px] border px-3.5 py-3 text-left font-normal normal-case"
            style={{
              width: `min(${CARD_W}px, calc(100vw - 24px))`,
              maxWidth: "calc(100vw - 24px)",
              left: pos?.left ?? 0,
              top: pos?.top ?? 0,
              visibility: pos ? "visible" : "hidden",
              backgroundColor: "var(--paper)",
              borderColor: "var(--ink)",
              borderWidth: 1,
              color: "var(--ink)",
              boxShadow:
                "0 1px 2px color-mix(in oklch, var(--ink) 12%, transparent), 0 10px 24px color-mix(in oklch, var(--ink) 14%, transparent)",
            }}
          >
            {title ? (
              <span className="text-[13px] font-semibold tracking-[-0.01em]">{title}</span>
            ) : null}
            <span className="text-[14px] leading-[1.4] text-[color:var(--graphite)]">{text}</span>
            {seat ? (
              <span className="mt-1 inline-flex">
                <MiniSeats active={seat} />
              </span>
            ) : null}
          </span>,
          document.body,
        )
      : null;

  return (
    <span
      ref={ref}
      className={`relative inline-flex ${className ?? ""}`}
      tabIndex={focusable ? 0 : undefined}
      aria-describedby={open ? id : undefined}
      onMouseEnter={() => schedule(true)}
      onMouseLeave={() => schedule(false)}
      onFocus={() => {
        clear();
        setOpen(true);
      }}
      onBlur={() => schedule(false)}
    >
      {children}
      {card}
    </span>
  );
}
