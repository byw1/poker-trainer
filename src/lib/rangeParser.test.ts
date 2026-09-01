import { describe, expect, it } from "vitest";
import { parseRange, rangePercent } from "./rangeParser";
import { CHARTS, POSITIONS } from "./charts";

describe("range parser", () => {
  it("expands pair shorthand", () => {
    const r = parseRange(["QQ+"]);
    expect(r["AA"]).toBe(1);
    expect(r["KK"]).toBe(1);
    expect(r["QQ"]).toBe(1);
    expect(r["JJ"]).toBe(0);
  });

  it("expands suited and offsuit plus shorthand", () => {
    const s = parseRange(["K9s+"]);
    expect(s["K9s"]).toBe(1);
    expect(s["KQs"]).toBe(1);
    expect(s["K8s"]).toBe(0);
    expect(s["K9o"]).toBe(0);

    const o = parseRange(["AQo+"]);
    expect(o["AQo"]).toBe(1);
    expect(o["AKo"]).toBe(1);
    expect(o["AJo"]).toBe(0);
  });

  it("expands exact hands", () => {
    const r = parseRange(["JTs"]);
    expect(r["JTs"]).toBe(1);
    expect(Object.values(r).filter((v) => v === 1)).toHaveLength(1);
  });

  it("rejects malformed tokens", () => {
    expect(() => parseRange(["XX"])).toThrow();
    expect(() => parseRange(["2As"])).toThrow();
  });

  it("gives every chart exactly 169 keys", () => {
    for (const p of POSITIONS) {
      expect(Object.keys(CHARTS[p])).toHaveLength(169);
    }
  });

  it("matches the labelled opening frequencies within tolerance", () => {
    const expected: Record<string, number> = { UTG: 13, MP: 18, CO: 26, BTN: 44, SB: 40 };
    for (const p of POSITIONS) {
      expect(Math.abs(rangePercent(CHARTS[p]) - expected[p]!)).toBeLessThanOrEqual(1.5);
    }
  });
});
