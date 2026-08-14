"use client";

import { useState } from "react";
import { toast } from "sonner";

import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function GoogleSignInButton({
  callbackUrl,
  label = "Continue with Google",
}: {
  callbackUrl?: string;
  label?: string;
}) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const start = async () => {
    setIsRedirecting(true);
    const { error } = await signIn.social({
      provider: "google",
      callbackURL: callbackUrl ?? "/dashboard",
    });
    if (error) {
      setIsRedirecting(false);
      toast.error("Could not start Google sign-in");
    }
    // On success the browser navigates away, so the pending state is never reset.
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="h-10 w-full"
      onClick={start}
      disabled={isRedirecting}
    >
      {isRedirecting ? "Redirecting…" : label}
    </Button>
  );
}

export function AuthMethodDivider() {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs text-muted-foreground">or</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
