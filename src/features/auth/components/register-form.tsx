"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { signUp } from "@/lib/auth-client";
import { navigateAndRefresh } from "@/lib/navigation";
import { registerSchema, type RegisterInput } from "@/features/auth/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/form-sheet";

import { AuthMethodDivider, GoogleSignInButton } from "./google-sign-in-button";

const DEFAULT_REDIRECT = "/dashboard";

export function RegisterForm({
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
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { displayName: "", email: "", password: "" },
  });

  const onSubmit = async (values: RegisterInput) => {
    const { error } = await signUp.email({
      name: values.displayName,
      email: values.email,
      password: values.password,
      callbackURL: callbackUrl ?? DEFAULT_REDIRECT,
    });

    if (error) {
      toast.error("Could not create the account", {
        description: error.message ?? "Try a different email address.",
      });
      return;
    }

    navigateAndRefresh(router, callbackUrl ?? DEFAULT_REDIRECT);
  };

  return (
    <div className="space-y-4">
      {googleEnabled ? (
        <>
          <GoogleSignInButton
            callbackUrl={callbackUrl}
            label="Sign up with Google"
          />
          <AuthMethodDivider />
        </>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField
          label="Name"
          htmlFor="displayName"
          error={errors.displayName?.message}
        >
          <Input
            id="displayName"
            autoComplete="name"
            aria-invalid={Boolean(errors.displayName)}
            {...register("displayName")}
          />
        </FormField>

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
          hint="At least 8 characters."
          error={errors.password?.message}
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
        </FormField>

        <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </div>
  );
}
