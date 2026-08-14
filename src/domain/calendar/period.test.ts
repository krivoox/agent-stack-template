import { describe, expect, it } from "vitest";
import {
  formatIsoUtcDate,
  getCurrentMonthPeriod,
  getCurrentWeekPeriod,
  inclusiveIsoRangeFromHalfOpen,
} from "./period";

describe("getCurrentMonthPeriod — SPEC-12 FR-04 / SPEC-05 parity", () => {
  it("returns UTC month boundaries for a reference date inside the month", () => {
    const now = new Date("2026-07-10T15:00:00Z");
    const { start, end } = getCurrentMonthPeriod(
      now,
      "America/Argentina/Buenos_Aires",
    );
    expect(start.toISOString()).toBe("2026-07-01T00:00:00.000Z");
    expect(end.toISOString()).toBe("2026-08-01T00:00:00.000Z");
  });

  it("uses the user's timezone: last day of month at 23:00 local is still that month", () => {
    // 2026-07-31 23:00 America/Argentina/Buenos_Aires → 2026-08-01 02:00 UTC
    const now = new Date("2026-08-01T02:00:00Z");
    const { start, end } = getCurrentMonthPeriod(
      now,
      "America/Argentina/Buenos_Aires",
    );
    expect(start.toISOString()).toBe("2026-07-01T00:00:00.000Z");
    expect(end.toISOString()).toBe("2026-08-01T00:00:00.000Z");
  });

  it("uses the user's timezone: first day of month at 00:30 local (Tokyo) is next month", () => {
    // 2026-08-01 00:30 Asia/Tokyo → 2026-07-31 15:30 UTC
    const now = new Date("2026-07-31T15:30:00Z");
    const { start, end } = getCurrentMonthPeriod(now, "Asia/Tokyo");
    expect(start.toISOString()).toBe("2026-08-01T00:00:00.000Z");
    expect(end.toISOString()).toBe("2026-09-01T00:00:00.000Z");
  });

  it("wraps December → January correctly", () => {
    const now = new Date("2026-12-15T12:00:00Z");
    const { start, end } = getCurrentMonthPeriod(now, "UTC");
    expect(start.toISOString()).toBe("2026-12-01T00:00:00.000Z");
    expect(end.toISOString()).toBe("2027-01-01T00:00:00.000Z");
  });
});

describe("getCurrentWeekPeriod — SPEC-05 §4.3", () => {
  it("returns Mon–Sun for a Wednesday local wall (T-09)", () => {
    // 2026-07-15 15:00 UTC = 12:00 America/Argentina/Buenos_Aires (Wed)
    const now = new Date("2026-07-15T15:00:00Z");
    const week = getCurrentWeekPeriod(
      now,
      "America/Argentina/Buenos_Aires",
    );
    const range = inclusiveIsoRangeFromHalfOpen(week);
    expect(range.from).toBe("2026-07-13");
    expect(range.to).toBe("2026-07-19");
    expect(week.start.toISOString()).toBe("2026-07-13T00:00:00.000Z");
    expect(week.end.toISOString()).toBe("2026-07-20T00:00:00.000Z");
  });

  it("treats Sunday as end of the current Mon–Sun week", () => {
    // 2026-07-19 18:00 UTC = 15:00 BA (Sunday)
    const now = new Date("2026-07-19T18:00:00Z");
    const range = inclusiveIsoRangeFromHalfOpen(
      getCurrentWeekPeriod(now, "America/Argentina/Buenos_Aires"),
    );
    expect(range.from).toBe("2026-07-13");
    expect(range.to).toBe("2026-07-19");
  });

  it("treats Monday as start of a new week", () => {
    const now = new Date("2026-07-13T15:00:00Z");
    const range = inclusiveIsoRangeFromHalfOpen(
      getCurrentWeekPeriod(now, "America/Argentina/Buenos_Aires"),
    );
    expect(range.from).toBe("2026-07-13");
    expect(range.to).toBe("2026-07-19");
  });
});

describe("inclusiveIsoRangeFromHalfOpen", () => {
  it("maps July half-open bounds to inclusive ISO days", () => {
    const range = inclusiveIsoRangeFromHalfOpen({
      start: new Date("2026-07-01T00:00:00.000Z"),
      end: new Date("2026-08-01T00:00:00.000Z"),
    });
    expect(range).toEqual({ from: "2026-07-01", to: "2026-07-31" });
    expect(formatIsoUtcDate(new Date("2026-07-01T00:00:00.000Z"))).toBe(
      "2026-07-01",
    );
  });
});
