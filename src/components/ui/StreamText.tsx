import { useEffect, useRef, useState } from "react";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

/** Reveals characters like a token stream. Reduced motion = instant. */
export function StreamText({
  text,
  charsPerTick = 2,
  tickMs = 9,
  blurTail = 6,
  caret = true,
  className,
  onDone,
}: {
  text: string;
  charsPerTick?: number;
  tickMs?: number;
  blurTail?: number;
  caret?: boolean;
  className?: string;
  onDone?: () => void;
}) {
  const [count, setCount] = useState(text.length);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (prefersReducedMotion()) {
      setCount(text.length);
      onDoneRef.current?.();
      return;
    }
    setCount(0);
    let i = 0;
    const id = setInterval(() => {
      i = Math.min(i + charsPerTick, text.length);
      setCount(i);
      if (i >= text.length) {
        clearInterval(id);
        onDoneRef.current?.();
      }
    }, tickMs);
    return () => clearInterval(id);
  }, [text, charsPerTick, tickMs]);

  const streaming = count < text.length;
  const shown = text.slice(0, count);
  const split = streaming ? Math.max(0, shown.length - blurTail) : shown.length;

  return (
    <span className={className}>
      {shown.slice(0, split)}
      {split < shown.length ? <span className="stream-tail">{shown.slice(split)}</span> : null}
      {caret ? (
        <span aria-hidden className={`stream-caret${streaming ? " is-streaming" : ""}`} />
      ) : null}
    </span>
  );
}
