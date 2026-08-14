"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormActions,
  FormField,
  FormSheet,
  FormStack,
} from "@/components/form-sheet";
import { refreshAfterMutation } from "@/lib/navigation";
import { createProjectAction } from "@/features/projects/actions";
import {
  createProjectSchema,
  type CreateProjectInput,
} from "@/features/projects/schemas";

/**
 * Reference create form.
 *
 * The shape of this file is the pattern to copy: RHF + the shared Zod schema,
 * a Server Action call, an `ok` check that surfaces the server's message, and
 * `refreshAfterMutation` so the list behind the sheet is not stale.
 */
export function NewProjectSheet({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { workspaceId, name: "", description: "" },
  });

  const onSubmit = async (values: CreateProjectInput) => {
    const result = await createProjectAction(values);

    if (!result.ok) {
      // A uniqueness clash belongs on the field; anything else is a form-level
      // problem the user cannot fix by editing one input.
      if (result.code === "project.name_taken") {
        setError("name", { message: result.error });
      } else {
        toast.error(result.error);
      }
      return;
    }

    toast.success("Project created");
    reset({ workspaceId, name: "", description: "" });
    setOpen(false);
    refreshAfterMutation(router);
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={setOpen}
      title="New project"
      description="Projects are scoped to the active workspace."
      trigger={
        <Button size="sm">
          <Plus className="size-4" />
          New project
        </Button>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormStack>
          <FormField label="Name" htmlFor="name" error={errors.name?.message}>
            <Input
              id="name"
              autoFocus
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />
          </FormField>

          <FormField
            label="Description"
            htmlFor="description"
            optional
            error={errors.description?.message}
          >
            <Textarea id="description" rows={3} {...register("description")} />
          </FormField>

          <FormActions>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create project"}
            </Button>
          </FormActions>
        </FormStack>
      </form>
    </FormSheet>
  );
}
