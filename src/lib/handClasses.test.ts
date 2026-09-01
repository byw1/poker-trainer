import { describe, expect, it } from "vitest";
import { ALL_HANDS, TOTAL_COMBOS, combos, gridCell, randomHand } from "./handClasses";

describe("hand classes", () => {
  it("enumerates 169 unique hands", () => {
    expect(ALL_HANDS).toHaveLength(169);
    expect(new Set(ALL_HANDS).size).toBe(169);
  });

  it("splits into 13 pairs, 78 suited, 78 offsuit", () => {
    expect(ALL_HANDS.filter((h) => h.length === 2)).toHaveLength(13);
    expect(ALL_HANDS.filter((h) => h.endsWith("s"))).toHaveLength(78);
    expect(ALL_HANDS.filter((h) => h.endsWith("o"))).toHaveLength(78);
  });

  it("maps grid cells by the standard convention", () => {
    expect(gridCell(0, 0)).toBe("AA");
    expect(gridCell(12, 12)).toBe("22");
    expect(gridCell(0, 1)).toBe("AKs");
    expect(gridCell(1, 0)).toBe("AKo");
    expect(gridCell(3, 4)).toBe("JTs");
    expect(gridCell(4, 3)).toBe("JTo");
  });

  it("counts 1326 total combinations", () => {
    expect(TOTAL_COMBOS).toBe(1326);
    expect(combos("AA")).toBe(6);
    expect(combos("AKs")).toBe(4);
    expect(combos("AKo")).toBe(12);
  });

  it("weights random hands by combo count", () => {
    let n = 0;
    const rng = () => (n = (n + 0.0137) % 1);
    let pairs = 0;
    for (let i = 0; i < 5000; i++) if (randomHand(rng).length === 2) pairs++;
    const share = pairs / 5000;
    expect(share).toBeGreaterThan(0.03);
    expect(share).toBeLessThan(0.09);
  });
});
