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

export const MOBILE_DEFAULT_DISPLAY: DisplaySettings = {
  table: false,
  captions: false,
  hoverHelp: false,
  insight: false,
  rangeAfter: false,
  sound: true,
};

export const DESKTOP_DEFAULT_DISPLAY: DisplaySettings = {
  table: true,
  captions: true,
  hoverHelp: true,
  insight: true,
  rangeAfter: true,
  sound: true,
};

/** Kept as the stable merge base for previously saved, possibly partial settings. */
export const DEFAULT_DISPLAY = DESKTOP_DEFAULT_DISPLAY;

const HYDRATION_DISPLAY: DisplaySettings = {
  ...MOBILE_DEFAULT_DISPLAY,
  sound: true,
};

export function getDefaultDisplay(): DisplaySettings {
  if (typeof window === "undefined") return HYDRATION_DISPLAY;
  return window.matchMedia("(max-width: 640px)").matches
    ? MOBILE_DEFAULT_DISPLAY
    : DESKTOP_DEFAULT_DISPLAY;
}

export function loadDisplay(): DisplaySettings {
  if (typeof window === "undefined") return HYDRATION_DISPLAY;
  try {
    const raw = window.localStorage.getItem(DISPLAY_KEY);
    if (!raw) return getDefaultDisplay();
    const parsed = JSON.parse(raw) as Partial<DisplaySettings>;
    return { ...DESKTOP_DEFAULT_DISPLAY, ...parsed };
  } catch {
    return getDefaultDisplay();
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
  const [display, setDisplay] = useState<DisplaySettings>(HYDRATION_DISPLAY);

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
