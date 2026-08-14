/**
 * The ONLY place that reads `process.env`.
 *
 * Everything else imports `env` from here. That gives one schema to audit, one
 * failure mode (a startup error naming the missing variable) and no silent
 * `undefined` leaking into runtime code.
 *
 * Adding a variable = edit this schema + `.env.example` + the hosting provider.
 */
import { z } from "zod";

const isProd = process.env.NODE_ENV === "production";

/** Optional locally so `pnpm dev` works on a fresh clone; mandatory in prod. */
const requiredInProd = <T extends z.ZodTypeAny>(schema: T) =>
  isProd ? schema : schema.optional();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  /** Runtime connection. Use a pooled URL when the host offers one. */
  DATABASE_URL: requiredInProd(z.string().url()),
  /** Direct (non-pooled) connection — migrations only. */
  DIRECT_URL: requiredInProd(z.string().url()),

  BETTER_AUTH_SECRET: isProd
    ? z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 chars")
    : z.string().min(1).default("dev-secret-please-change-me-32-chars-min"),
  /** Canonical app URL. On Vercel Preview this is overridden by VERCEL_URL. */
  BETTER_AUTH_URL: z.string().url().optional(),
  /** Comma-separated extra CSRF origins, e.g. "https://app.example.com". */
  BETTER_AUTH_TRUSTED_ORIGINS: z.string().optional(),

  /** Vercel system variables. */
  VERCEL_ENV: z.enum(["production", "preview", "development"]).optional(),
  VERCEL_URL: z.string().optional(),

  /** Optional Google OAuth. Without both values the button stays hidden. */
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),

  /** "1" / "true" logs every Prisma SQL statement in development. */
  PRISMA_LOG_QUERIES: z
    .enum(["0", "1", "true", "false"])
    .optional()
    .default("0"),

  /** Bearer token required by `/api/cron/*` route handlers. */
  CRON_SECRET: z.string().min(1).optional(),
});

/**
 * Resolve the auth base URL so Preview deployments match the request Origin.
 *
 * Preview URLs are ephemeral. Sharing a static `BETTER_AUTH_URL` with
 * Production makes the CSRF origin check reject sign-in on every preview.
 */
function resolveAuthUrl(input: {
  BETTER_AUTH_URL?: string;
  VERCEL_ENV?: "production" | "preview" | "development";
  VERCEL_URL?: string;
}): string {
  if (input.VERCEL_ENV === "preview" && input.VERCEL_URL) {
    return `https://${input.VERCEL_URL}`;
  }
  if (input.BETTER_AUTH_URL) return input.BETTER_AUTH_URL;
  if (input.VERCEL_URL) return `https://${input.VERCEL_URL}`;
  return "http://localhost:3000";
}

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(
    `Invalid environment variables. Set them in .env / .env.local.\n${details}`,
  );
}

const data = parsed.data;

export const env = {
  ...data,
  BETTER_AUTH_URL: resolveAuthUrl(data),
};

/** True when Google social sign-in can be offered (both credentials present). */
export const isGoogleOAuthEnabled = Boolean(
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET,
);

export type Env = typeof env;
