import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { nextCookies } from "@/lib/next-cookies";
import { APP_NAME } from "@/lib/app-config";
import { createPersonalWorkspaceForUser } from "@/features/workspaces/services/create-personal-workspace";

const googleClientId = env.GOOGLE_CLIENT_ID;
const googleClientSecret = env.GOOGLE_CLIENT_SECRET;

/** Omitted entirely when credentials are absent, so the feature degrades. */
const googleSocialProviders =
  googleClientId && googleClientSecret
    ? {
        google: {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
          prompt: "select_account" as const,
        },
      }
    : undefined;

function hostFromUrl(url: string): string | undefined {
  try {
    return new URL(url).host;
  } catch {
    return undefined;
  }
}

/** Extra CSRF origins beyond the ones implied by `baseURL.allowedHosts`. */
function trustedOrigins(): string[] {
  const origins =
    env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean) ?? [];

  if (env.VERCEL_URL) origins.push(`https://${env.VERCEL_URL}`);
  if (env.VERCEL_ENV === "preview" || env.VERCEL_ENV === "production") {
    origins.push("https://*.vercel.app");
  }

  if (env.NODE_ENV === "production") return origins;

  // LAN origins so you can test on a phone against `next dev`.
  return [
    ...origins,
    "http://192.168.*.*:*",
    "http://10.*.*.*:*",
    "http://172.*.*.*:*",
    "http://127.0.0.1:*",
  ];
}

/**
 * Dynamic base URL: resolve the host per request so ephemeral preview
 * deployments match the browser Origin. A static base URL shared with
 * production makes every preview fail the CSRF origin check.
 *
 * @see https://www.better-auth.com/docs/guides/dynamic-base-url
 */
function resolveBaseURL() {
  const fallback = env.BETTER_AUTH_URL;
  const canonicalHost = hostFromUrl(fallback);
  const allowedHosts = [
    "localhost:*",
    "127.0.0.1:*",
    "*.vercel.app",
    ...(canonicalHost ? [canonicalHost] : []),
  ];

  if (env.NODE_ENV !== "production") {
    allowedHosts.push("192.168.*.*:*", "10.*.*.*:*", "172.*.*.*:*");
  }

  return {
    allowedHosts,
    protocol: env.NODE_ENV === "development" ? ("http" as const) : ("https" as const),
    fallback,
  };
}

export const auth = betterAuth({
  appName: APP_NAME,
  baseURL: resolveBaseURL(),
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: trustedOrigins(),
  /** OAuth failures land on /login with `?error=` instead of a dev error page. */
  onAPIError: { errorURL: "/login" },
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
    /**
     * No transactional email provider is wired yet. The token is still created
     * and validated in the database, so the flow works end to end; in
     * development the URL is logged so you can copy it from the terminal.
     *
     * Replace this with a real provider before shipping password reset.
     */
    sendResetPassword: async ({ user, url, token }) => {
      if (env.NODE_ENV !== "production") {
        console.info(
          `[auth] Password reset for ${user.email}\n  token: ${token}\n  url:   ${url}`,
        );
      }
    },
    revokeSessionsOnPasswordReset: true,
  },
  socialProviders: googleSocialProviders,
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      /**
       * Default is `true`, which rejects linking for password users who never
       * verified their email and surfaces `account_not_linked`. Google already
       * verified the address, so we trust it.
       */
      requireLocalEmailVerified: false,
      updateUserInfoOnLink: false,
    },
    /**
     * iOS Safari and installed PWAs frequently drop the short-lived OAuth state
     * cookie when the flow leaves the app. State still lives in the Verification
     * table (single use), so skipping the cookie check avoids a false
     * `state_security_mismatch`.
     */
    skipStateCookieCheck: true,
  },
  user: {
    additionalFields: {
      displayName: { type: "string", required: false, input: true },
      timezone: {
        type: "string",
        required: false,
        defaultValue: "UTC",
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  databaseHooks: {
    user: {
      create: {
        /**
         * Runs only when a User row is created (sign-up, or first social login
         * with a new email). Linking a provider to an existing user does not
         * create a User, so this does not re-run and does not clobber state.
         */
        after: async (user) => {
          await createPersonalWorkspaceForUser({
            userId: user.id,
            userName: user.name ?? user.email,
          });
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export type Auth = typeof auth;
