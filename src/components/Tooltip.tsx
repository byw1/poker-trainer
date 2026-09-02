import { useCallback, useEffect, useId, useRef, useState } from "react";
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
  /** When false, tapping/clicking never toggles the card (tabs switch mode instead). */
  toggleOnClick?: boolean;
  /** Adds a small info mark so touch users can open the card without clicking the control. */
  infoMark?: boolean;
}

const OPEN_DELAY = 150;
const CLOSE_DELAY = 100;
const CARD_W = 280;

/**
 * Quiet paper hover card: hover/focus opens after 150ms, closes 100ms after the
 * pointer leaves both trigger and card, so the card itself stays readable.
 */
export function Tooltip({
  text,
  title,
  seat,
  children,
  className,
  focusable = true,
  toggleOnClick = true,
  infoMark = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number; flipped: boolean }>({
    left: 0,
    top: 0,
    flipped: false,
  });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLSpanElement>(null);
  const id = useId();

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const schedule = useCallback((next: boolean) => {
    clear();
    timer.current = setTimeout(() => setOpen(next), next ? OPEN_DELAY : CLOSE_DELAY);
  }, []);

  useEffect(() => clear, []);

  // Fixed positioning so the card escapes clipped containers; flips above when
  // it would run off the bottom of the viewport.
  useEffect(() => {
    if (!open) return;
    const place = () => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const cardH = cardRef.current?.offsetHeight ?? 120;
      const below = r.bottom + 10;
      const flipped = below + cardH > window.innerHeight - 12;
      const left = Math.min(
        Math.max(r.left + r.width / 2, CARD_W / 2 + 10),
        window.innerWidth - CARD_W / 2 - 10,
      );
      setPos({ left, top: flipped ? r.top - 10 - cardH : below, flipped });
    };
    place();
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
      if (!ref.current?.contains(t) && !cardRef.current?.contains(t)) setOpen(false);
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
      onMouseEnter={() => schedule(true)}
      onMouseLeave={() => schedule(false)}
      onFocus={() => {
        clear();
        setOpen(true);
      }}
      onBlur={() => schedule(false)}
      onClick={toggleOnClick ? () => setOpen((v) => !v) : undefined}
    >
      {children}
      {infoMark ? (
        <button
          type="button"
          aria-label={`What is ${title ?? "this"}?`}
          onClick={(e) => {
            e.stopPropagation();
            clear();
            setOpen((v) => !v);
          }}
          className="info-mark ml-1 inline-flex h-[14px] w-[14px] items-center justify-center self-center rounded-full border text-[9px] font-semibold leading-none"
          style={{ borderColor: "var(--bone)", color: "var(--graphite)" }}
        >
          i
        </button>
      ) : null}
      {open ? (
        <span
          ref={cardRef}
          id={id}
          role="tooltip"
          onMouseEnter={clear}
          onMouseLeave={() => schedule(false)}
          className="hover-card fixed z-50 flex -translate-x-1/2 flex-col gap-1.5 rounded-[8px] border px-3.5 py-3 text-left font-normal normal-case"
          style={{
            width: CARD_W,
            left: pos.left,
            top: pos.top,
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
        </span>
      ) : null}
    </span>
  );
}
