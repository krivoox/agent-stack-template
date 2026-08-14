import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/features/auth/components/login-form";
import { isGoogleOAuthEnabled } from "@/lib/env";
import { getSession } from "@/lib/session";
import { DEFAULT_AUTHENTICATED_ROUTE } from "@/lib/app-config";

export const metadata = {
  title: "Sign in",
  robots: { index: false, follow: true },
};

type SearchParams = { callbackUrl?: string };

/**
 * Only same-origin paths are accepted. An open redirect here would let a
 * crafted link bounce a freshly-authenticated user to an attacker's page.
 */
function safeCallbackUrl(callbackUrl?: string): string | undefined {
  if (!callbackUrl?.startsWith("/") || callbackUrl.startsWith("//")) {
    return undefined;
  }
  if (callbackUrl.startsWith("/api/")) return undefined;
  return callbackUrl;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { callbackUrl: raw } = await searchParams;
  const callbackUrl = safeCallbackUrl(raw);

  const session = await getSession();
  if (session?.user?.id) redirect(callbackUrl ?? DEFAULT_AUTHENTICATED_ROUTE);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-foreground">Sign in</h1>
        <p className="text-xs text-muted-foreground">
          Use your account to continue.
        </p>
      </div>

      <LoginForm callbackUrl={callbackUrl} googleEnabled={isGoogleOAuthEnabled} />

      <div className="space-y-2 text-center text-xs text-muted-foreground">
        <p>
          <Link
            href="/forgot-password"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Forgot your password?
          </Link>
        </p>
        <p>
          No account yet?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
