/**
 * Tiny Web Audio sound kit — oscillators and filtered noise only, no files,
 * no network. Created lazily on the first user gesture.
 */

const KEY = "poker-trainer-sound";

let ctx: AudioContext | null = null;
let enabled = true;

export function soundEnabled(): boolean {
  return enabled;
}

/** Reads the persisted preference; defaults to on. */
export function initSound(): boolean {
  try {
    enabled = localStorage.getItem(KEY) !== "off";
  } catch {
    enabled = true;
  }
  return enabled;
}

export function setSoundEnabled(on: boolean): void {
  enabled = on;
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* storage unavailable — preference stays for this session */
  }
  if (!on && ctx) void ctx.suspend();
  if (on && ctx) void ctx.resume();
}

function audio(): AudioContext | null {
  if (typeof window === "undefined" || !enabled) return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  freq: number,
  at: number,
  dur: number,
  gain: number,
  type: OscillatorType = "sine",
): void {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + at;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

/** Short filtered noise burst — the "paper" part of a card tick. */
function noise(at: number, dur: number, gain: number, freq: number, q = 1): void {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + at;
  const frames = Math.max(1, Math.floor(a.sampleRate * dur));
  const buf = a.createBuffer(1, frames, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  const src = a.createBufferSource();
  src.buffer = buf;
  const filter = a.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = freq;
  filter.Q.value = q;
  const g = a.createGain();
  g.gain.value = gain;
  src.connect(filter).connect(g).connect(a.destination);
  src.start(t);
}

export const sound = {
  deal() {
    noise(0, 0.05, 0.16, 2200);
    noise(0.07, 0.05, 0.14, 2000);
  },
  flip() {
    noise(0, 0.045, 0.13, 3000, 1.5);
  },
  fold() {
    tone(120, 0, 0.16, 0.1, "sine");
    noise(0, 0.08, 0.05, 400);
  },
  raise() {
    tone(660, 0, 0.05, 0.08, "triangle");
    noise(0.04, 0.06, 0.1, 2600, 2);
  },
  correct() {
    tone(523.25, 0, 0.12, 0.09, "sine");
    tone(783.99, 0.11, 0.18, 0.08, "sine");
  },
  incorrect() {
    tone(174.61, 0, 0.26, 0.09, "sine");
  },
};
