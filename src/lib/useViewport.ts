import { useEffect, useState } from "react";

/**
 * Viewport width, hydration-safe: server and first client render assume the
 * desktop default, then the effect corrects it before paint-visible layout.
 */
export function useViewportWidth(fallback = 1024): number {
  const [w, setW] = useState(fallback);

  useEffect(() => {
    const read = () => setW(window.innerWidth);
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  return w;
}

/** True below the Tailwind sm breakpoint. */
export function useIsPhone(): boolean {
  return useViewportWidth() < 640;
}
