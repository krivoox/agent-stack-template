import { z } from "zod";

const isProd = process.env.NODE_ENV === "production";

const requiredInProd = <T extends z.ZodTypeAny>(schema: T) =>
  isProd ? schema : schema.optional();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  DATABASE_URL: requiredInProd(z.string().url()),
  DIRECT_URL: requiredInProd(z.string().url()),

  BETTER_AUTH_SECRET: isProd
    ? z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 chars")
    : z.string().min(1).default("dev-secret-please-change-me-32-chars-min"),
  BETTER_AUTH_URL: z.string().url().optional(),
  BETTER_AUTH_TRUSTED_ORIGINS: z.string().optional(),

  VERCEL_ENV: z.enum(["production", "preview", "development"]).optional(),
  VERCEL_URL: z.string().optional(),

  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),

  PRISMA_LOG_QUERIES: z
    .enum(["0", "1", "true", "false"])
    .optional()
    .default("0"),

  CRON_SECRET: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(1).optional(),
  AUTH_RELAX_OAUTH_STATE: z.enum(["0", "1", "true", "false"]).optional(),
  AUTH_RELAX_ACCOUNT_LINKING: z.enum(["0", "1", "true", "false"]).optional(),
});

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

export const isGoogleOAuthEnabled = Boolean(
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET,
);

function flagOn(value?: string): boolean {
  return value === "1" || value === "true";
}

export const relaxOauthState = flagOn(env.AUTH_RELAX_OAUTH_STATE);
export const relaxAccountLinking = flagOn(env.AUTH_RELAX_ACCOUNT_LINKING);

export type Env = typeof env;
