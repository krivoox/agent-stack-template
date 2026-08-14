/**
 * Fixed `nextCookies` for Better Auth + Next.js.
 *
 * Upstream `nextCookies()` uses `Headers.get("set-cookie")`, which returns
 * `null` in Node when multiple Set-Cookie headers are present (e.g. session
 * token + cookieCache). That silently drops cookies for Server Actions and
 * can leave PWAs stuck on /login after Google id_token sign-in.
 *
 * @see https://github.com/better-auth/better-auth/issues/9705
 */

import {
  createAuthMiddleware,
  setShouldSkipSessionRefresh,
} from "better-auth/api";
import {
  parseSetCookieHeader,
  splitSetCookieHeader,
  toCookieOptions,
} from "better-auth/cookies";

function listSetCookieHeaders(headers: Headers): string[] {
  if (typeof headers.getSetCookie === "function") {
    const list = headers.getSetCookie();
    if (list.length > 0) return list;
  }
  return splitSetCookieHeader(headers.get("set-cookie") || "");
}

export function nextCookies() {
  return {
    id: "next-cookies",
    hooks: {
      before: [
        {
          matcher(ctx: { path?: string }) {
            return ctx.path === "/get-session";
          },
          handler: createAuthMiddleware(async (ctx) => {
            if ("_flag" in ctx && ctx._flag === "router") return;
            let headersStore;
            try {
              const { headers } = await import("next/headers");
              headersStore = await headers();
            } catch {
              return;
            }
            const isRSC = headersStore.get("RSC") === "1";
            const isServerAction = Boolean(headersStore.get("next-action"));
            if (isRSC && !isServerAction) {
              await setShouldSkipSessionRefresh(true);
            }
          }),
        },
      ],
      after: [
        {
          matcher() {
            return true;
          },
          handler: createAuthMiddleware(async (ctx) => {
            const returned = ctx.context.responseHeaders;
            if ("_flag" in ctx && ctx._flag === "router") return;
            if (!(returned instanceof Headers)) return;

            const setCookieList = listSetCookieHeaders(returned);
            if (setCookieList.length === 0) return;

            let cookieHelper;
            try {
              const { cookies } = await import("next/headers");
              cookieHelper = await cookies();
            } catch (error) {
              if (
                error instanceof Error &&
                (error.message.startsWith(
                  "`cookies` was called outside a request scope.",
                ) ||
                  error.message.includes("Cannot find module"))
              ) {
                return;
              }
              throw error;
            }

            for (const raw of setCookieList) {
              const parsed = parseSetCookieHeader(raw);
              parsed.forEach((value, key) => {
                if (!key) return;
                try {
                  cookieHelper.set(key, value.value, toCookieOptions(value));
                } catch {
                  // Next may throw when cookies cannot be mutated in this context.
                }
              });
            }
          }),
        },
      ],
    },
  };
}
