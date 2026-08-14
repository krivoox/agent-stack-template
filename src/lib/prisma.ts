import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

function shouldLogQueries(): boolean {
  if (env.NODE_ENV !== "development") return false;
  return env.PRISMA_LOG_QUERIES === "1" || env.PRISMA_LOG_QUERIES === "true";
}

/**
 * Supabase PgBouncer (and many managed Postgres) drop idle TCP sessions.
 * A long-lived Next.js process keeps a `pg.Pool`; if we reuse a connection the
 * server already closed, queries fail with "Connection terminated unexpectedly"
 * (often surfaces as Better Auth FAILED_TO_GET_SESSION).
 *
 * Recycle idle clients before the remote side does, cap pool size, and swallow
 * pool-level errors so a dead socket doesn't become an uncaughtException.
 */
function createPgPool(): Pool {
  const pool = new Pool({
    connectionString: env.DATABASE_URL ?? "",
    // Dev + warm serverless: keep this low; each instance multiplies against the pooler.
    max: env.NODE_ENV === "production" ? 5 : 5,
    idleTimeoutMillis: 15_000,
    connectionTimeoutMillis: 10_000,
    allowExitOnIdle: env.NODE_ENV === "production",
    keepAlive: true,
    keepAliveInitialDelayMillis: 10_000,
  });

  pool.on("error", (err) => {
    console.error("[pg.Pool] idle client error:", err.message);
  });

  return pool;
}

function getPgPool(): Pool {
  if (globalForPrisma.pgPool) return globalForPrisma.pgPool;
  const pool = createPgPool();
  // Always cache on globalThis so Turbopack/HMR and warm isolates share one pool.
  globalForPrisma.pgPool = pool;
  return pool;
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg(getPgPool());

  return new PrismaClient({
    adapter,
    log: shouldLogQueries()
      ? ["query", "error", "warn"]
      : env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

/**
 * HMR / long-lived `globalThis` can keep a PrismaClient from before a schema
 * change. Recreate when required delegates are missing (ADR-006 / SPEC-19).
 */
function hasRequiredDelegates(client: PrismaClient): boolean {
  const c = client as PrismaClient & {
    workspaceConsolidationRate?: { findUnique?: unknown };
    currencyExchange?: { findUnique?: unknown };
    usdQuoteSnapshot?: { findFirst?: unknown };
  };
  return (
    typeof c.workspaceConsolidationRate?.findUnique === "function" &&
    typeof c.currencyExchange?.findUnique === "function" &&
    typeof c.usdQuoteSnapshot?.findFirst === "function"
  );
}

function getPrismaClient(): PrismaClient {
  const existing = globalForPrisma.prisma;
  if (existing && hasRequiredDelegates(existing)) {
    return existing;
  }

  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  return client;
}

export const prisma: PrismaClient = getPrismaClient();

const TRANSIENT_CONNECTION_RE =
  /Connection terminated unexpectedly|Connection terminated|ECONNRESET|ETIMEDOUT|the database system is starting up|cannot acquire a connection/i;

export function isTransientDbConnectionError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const message =
    "message" in err && typeof err.message === "string" ? err.message : "";
  const cause =
    "cause" in err &&
    err.cause &&
    typeof err.cause === "object" &&
    "message" in err.cause &&
    typeof (err.cause as { message: unknown }).message === "string"
      ? (err.cause as { message: string }).message
      : "";
  return TRANSIENT_CONNECTION_RE.test(message) || TRANSIENT_CONNECTION_RE.test(cause);
}

/** One automatic retry for dead-pool / pooler blips. */
export async function withDbRetry<T>(
  operation: () => Promise<T>,
  opts?: { label?: string },
): Promise<T> {
  try {
    return await operation();
  } catch (err) {
    if (!isTransientDbConnectionError(err)) throw err;
    if (env.NODE_ENV === "development") {
      console.warn(
        `[prisma] transient connection error${opts?.label ? ` (${opts.label})` : ""}; retrying once`,
      );
    }
    return await operation();
  }
}
