import Link from "next/link";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/features/auth/components/register-form";
import { isGoogleOAuthEnabled } from "@/lib/env";
import { getSession } from "@/lib/session";
import { DEFAULT_AUTHENTICATED_ROUTE } from "@/lib/app-config";

export const metadata = {
  title: "Create account",
  robots: { index: false, follow: true },
};

export default async function RegisterPage() {
  const session = await getSession();
  if (session?.user?.id) redirect(DEFAULT_AUTHENTICATED_ROUTE);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-foreground">
          Create your account
        </h1>
        <p className="text-xs text-muted-foreground">
          A personal workspace is created for you automatically.
        </p>
      </div>

      <RegisterForm googleEnabled={isGoogleOAuthEnabled} />

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
