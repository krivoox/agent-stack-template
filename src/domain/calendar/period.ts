/**
 * Shared calendar period helpers (timezone-aware).
 *
 * One definition of "this month" / "this week" for every feature that filters
 * by date. Boundaries are projected onto UTC-midnight dates so they compare
 * cleanly with Prisma `@db.Date` columns.
 *
 * `start` is inclusive; `end` is exclusive (00:00 of the day after the range).
 */

import { TZDate } from "@date-fns/tz";

export type CalendarPeriod = {
  readonly start: Date;
  readonly end: Date;
};

export type InclusiveIsoRange = {
  readonly from: string;
  readonly to: string;
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Format a UTC-midnight `Date` as `YYYY-MM-DD`. */
export function formatIsoUtcDate(date: Date): string {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

/**
 * Inclusive ISO day range covering a half-open `[start, end)` calendar period.
 */
export function inclusiveIsoRangeFromHalfOpen(
  period: CalendarPeriod,
): InclusiveIsoRange {
  const lastDayMs = period.end.getTime() - 86_400_000;
  return {
    from: formatIsoUtcDate(period.start),
    to: formatIsoUtcDate(new Date(lastDayMs)),
  };
}

/**
 * SPEC-12 FR-04 / SPEC-05 §4.3 — Current calendar month in the user's timezone.
 *
 * Example: `now = 2026-08-01T02:00:00Z`, `America/Argentina/Buenos_Aires`
 * → local wall 2026-07-31 23:00 → July 2026
 *   `start = 2026-07-01T00:00Z`, `end = 2026-08-01T00:00Z`.
 */
export function getCurrentMonthPeriod(
  now: Date,
  timezone: string,
): CalendarPeriod {
  const localNow = new TZDate(now.getTime(), timezone);
  const year = localNow.getFullYear();
  const month = localNow.getMonth();
  return {
    start: new Date(Date.UTC(year, month, 1)),
    end: new Date(Date.UTC(year, month + 1, 1)),
  };
}

/**
 * SPEC-05 §4.3 — Current calendar week Monday–Sunday in the user's timezone.
 *
 * Not a rolling 7-day window and not the budget weekly anchor (`getWeeklyBounds`).
 * Returns half-open `[monday, nextMonday)`.
 */
export function getCurrentWeekPeriod(
  now: Date,
  timezone: string,
): CalendarPeriod {
  const localNow = new TZDate(now.getTime(), timezone);
  const year = localNow.getFullYear();
  const month = localNow.getMonth();
  const day = localNow.getDate();
  const dow = localNow.getDay(); // 0 Sun … 6 Sat
  const mondayOffset = dow === 0 ? -6 : 1 - dow;

  const start = new Date(Date.UTC(year, month, day + mondayOffset));
  const end = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + 7),
  );

  return { start, end };
}
