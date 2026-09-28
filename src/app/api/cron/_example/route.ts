import { NextResponse } from "next/server";
import { assertCronAuth, CronAuthError } from "@/lib/cron";

/**
 * Example cron route. Copy this file, rename it, call `assertCronAuth` first.
 * Invoke with `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(request: Request) {
  try {
    assertCronAuth(request);
  } catch (err) {
    if (err instanceof CronAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  return NextResponse.json({ ok: true });
}
