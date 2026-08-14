import Link from "next/link";

import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: true },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-lg font-semibold text-foreground">
          This link is not valid
        </h1>
        <p className="text-xs text-muted-foreground text-pretty">
          Reset links expire. Request a new one and use the most recent email.
        </p>
        <Link
          href="/forgot-password"
          className="text-xs font-medium text-foreground underline-offset-4 hover:underline"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-foreground">
          Choose a new password
        </h1>
        <p className="text-xs text-muted-foreground">
          Signing in again on your other devices will be required.
        </p>
      </div>

      <ResetPasswordForm token={token} />
    </div>
  );
}
