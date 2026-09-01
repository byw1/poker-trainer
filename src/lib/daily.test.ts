import { describe, expect, it } from "vitest";
import { dailyQuestions, DAILY_COUNT, hashSeed, mulberry32, todayKey } from "./daily";
import { openRaiseDrill } from "@/drills/openRaise";

describe("daily challenge", () => {
  it("produces ten prompts", () => {
    expect(dailyQuestions(openRaiseDrill, "2026-01-01")).toHaveLength(DAILY_COUNT);
  });

  it("gives the same ten prompts for the same seed", () => {
    const a = dailyQuestions(openRaiseDrill, "2026-03-14").map((q) => q.prompt);
    const b = dailyQuestions(openRaiseDrill, "2026-03-14").map((q) => q.prompt);
    expect(a).toEqual(b);
  });

  it("gives different prompts for different seeds", () => {
    const a = dailyQuestions(openRaiseDrill, "2026-03-14").map((q) => `${q.prompt.position}${q.prompt.hand}`);
    const b = dailyQuestions(openRaiseDrill, "2026-03-15").map((q) => `${q.prompt.position}${q.prompt.hand}`);
    expect(a).not.toEqual(b);
  });

  it("mulberry32 is deterministic and in range", () => {
    const r1 = mulberry32(hashSeed("x"));
    const r2 = mulberry32(hashSeed("x"));
    for (let i = 0; i < 20; i++) {
      const v = r1();
      expect(v).toBe(r2());
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("formats the date key as YYYY-MM-DD", () => {
    expect(todayKey(new Date("2026-09-01T18:00:00Z"))).toBe("2026-09-01");
    // 00:30 UTC is still the previous day in Los Angeles
    expect(todayKey(new Date("2026-09-02T00:30:00Z"))).toBe("2026-09-01");
  });
});
