import { useCallback, useEffect, useState } from "react";

export interface DisplaySettings {
  table: boolean;
  captions: boolean;
  hoverHelp: boolean;
  insight: boolean;
  rangeAfter: boolean;
  sound: boolean;
}

export const DISPLAY_KEY = "poker-trainer-display";

export const DEFAULT_DISPLAY: DisplaySettings = {
  table: true,
  captions: true,
  hoverHelp: true,
  insight: true,
  rangeAfter: true,
  sound: true,
};

export function loadDisplay(): DisplaySettings {
  if (typeof window === "undefined") return DEFAULT_DISPLAY;
  try {
    const raw = window.localStorage.getItem(DISPLAY_KEY);
    if (!raw) return DEFAULT_DISPLAY;
    const parsed = JSON.parse(raw) as Partial<DisplaySettings>;
    return { ...DEFAULT_DISPLAY, ...parsed };
  } catch {
    return DEFAULT_DISPLAY;
  }
}

export function saveDisplay(s: DisplaySettings) {
  try {
    window.localStorage.setItem(DISPLAY_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

/** Hydration-safe display settings: defaults on the server, stored values after mount. */
export function useDisplay() {
  const [display, setDisplay] = useState<DisplaySettings>(DEFAULT_DISPLAY);

  useEffect(() => {
    setDisplay(loadDisplay());
  }, []);

  const set = useCallback((patch: Partial<DisplaySettings>) => {
    setDisplay((prev) => {
      const nextValue = { ...prev, ...patch };
      saveDisplay(nextValue);
      return nextValue;
    });
  }, []);

  return { display, set };
}
