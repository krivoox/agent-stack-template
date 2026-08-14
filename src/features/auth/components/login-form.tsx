"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { signIn } from "@/lib/auth-client";
import { navigateAndRefresh } from "@/lib/navigation";
import { loginSchema, type LoginInput } from "@/features/auth/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/form-sheet";

import { AuthMethodDivider, GoogleSignInButton } from "./google-sign-in-button";

const DEFAULT_REDIRECT = "/dashboard";

export function LoginForm({
  callbackUrl,
  googleEnabled = false,
}: {
  callbackUrl?: string;
  googleEnabled?: boolean;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginInput) => {
    const { error } = await signIn.email({
      email: values.email,
      password: values.password,
      callbackURL: callbackUrl ?? DEFAULT_REDIRECT,
    });

    if (error) {
      // Deliberately vague: naming which half was wrong is an account oracle.
      toast.error("Could not sign in", {
        description: googleEnabled
          ? "Check your email and password. If you signed up with Google, use “Continue with Google”."
          : "Check your email and password.",
      });
      return;
    }

    navigateAndRefresh(router, callbackUrl ?? DEFAULT_REDIRECT);
  };

  return (
    <div className="space-y-4">
      {googleEnabled ? (
        <>
          <GoogleSignInButton callbackUrl={callbackUrl} />
          <AuthMethodDivider />
        </>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="password"
          error={errors.password?.message}
        >
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
        </FormField>

        <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
