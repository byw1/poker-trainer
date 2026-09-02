import { describe, expect, it } from "vitest";
import { EQUITY_VS_RANDOM, equityVsRandom } from "./equityVsRandom";
import { ALL_HANDS } from "./handClasses";

describe("equity vs a random hand", () => {
  it("covers all 169 hand classes", () => {
    expect(Object.keys(EQUITY_VS_RANDOM)).toHaveLength(169);
    for (const h of ALL_HANDS) expect(EQUITY_VS_RANDOM[h]).toBeGreaterThan(0);
  });

  it("puts aces on top and 72o near the bottom", () => {
    expect(equityVsRandom("AA")).toBeGreaterThan(84);
    expect(equityVsRandom("72o")).toBeLessThan(35);
  });

  it("prefers suited to offsuit", () => {
    expect(equityVsRandom("AKs")).toBeGreaterThan(equityVsRandom("AKo"));
  });
});
