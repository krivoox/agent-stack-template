"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormActions, FormField, FormStack } from "@/components/form-sheet";
import { refreshAfterMutation } from "@/lib/navigation";
import { updateProfileAction } from "@/features/auth/actions/update-profile";
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/features/auth/schemas";

export function UpdateProfileForm({
  defaultValues,
}: {
  defaultValues: UpdateProfileInput;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues,
  });

  const onSubmit = async (values: UpdateProfileInput) => {
    const result = await updateProfileAction(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Profile updated");
    refreshAfterMutation(router);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormStack>
        <FormField
          label="Display name"
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

        <FormField
          label="Timezone"
          htmlFor="timezone"
          hint="IANA identifier, e.g. Europe/Madrid."
          error={errors.timezone?.message}
        >
          <Input
            id="timezone"
            aria-invalid={Boolean(errors.timezone)}
            {...register("timezone")}
          />
        </FormField>

        <FormActions>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save changes"}
          </Button>
        </FormActions>
      </FormStack>
    </form>
  );
}
