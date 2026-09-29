import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { env, relaxAccountLinking, relaxOauthState } from "@/lib/env";
import { nextCookies } from "@/lib/next-cookies";
import { APP_NAME } from "@/lib/app-config";
import { createPersonalWorkspaceForUser } from "@/features/workspaces/services/create-personal-workspace";
import { send, isPasswordResetEnabled } from "@/lib/mail";
import { log } from "@/lib/log";

const googleClientId = env.GOOGLE_CLIENT_ID;
const googleClientSecret = env.GOOGLE_CLIENT_SECRET;

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

function trustedOrigins(): string[] {
  const origins =
    env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean) ?? [];

  if (env.VERCEL_URL) origins.push(`https://${env.VERCEL_URL}`);

  if (env.NODE_ENV === "production") return origins;

  return [
    ...origins,
    "http://192.168.*.*:*",
    "http://10.*.*.*:*",
    "http://172.*.*.*:*",
    "http://127.0.0.1:*",
  ];
}

function resolveBaseURL() {
  const fallback = env.BETTER_AUTH_URL;
  const canonicalHost = hostFromUrl(fallback);
  const allowedHosts = [
    "localhost:*",
    "127.0.0.1:*",
    ...(env.VERCEL_ENV === "production" ? [] : ["*.vercel.app"]),
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
  onAPIError: { errorURL: "/login" },
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      if (!isPasswordResetEnabled()) {
        throw new Error("mailer_not_configured");
      }
      log.info("auth.reset_requested", { userId: user.id, email: user.email });
      await send({
        to: user.email,
        subject: `Reset your ${APP_NAME} password`,
        html: `<p>Reset your password:</p><p><a href="${url}">Choose a new password</a></p>`,
      });
    },
    revokeSessionsOnPasswordReset: true,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 20,
  },
  socialProviders: googleSocialProviders,
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      requireLocalEmailVerified: !relaxAccountLinking,
      updateUserInfoOnLink: false,
    },
    skipStateCookieCheck: relaxOauthState,
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
