import "server-only";
import { timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

export class CronAuthError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "CronAuthError";
  }
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/**
 * Fail-closed auth for `/api/cron/*`.
 * Missing CRON_SECRET in any environment refuses the handler.
 */
export function assertCronAuth(request: Request): void {
  if (!env.CRON_SECRET) {
    throw new CronAuthError("cron_not_configured", 503);
  }

  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token || !safeEqual(token, env.CRON_SECRET)) {
    throw new CronAuthError("unauthorized", 401);
  }
}
