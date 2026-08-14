"use server";

import { revalidatePath } from "next/cache";

import { defineWorkspaceAction } from "@/lib/action";
import { assertCanWrite, assertRole } from "@/features/workspaces/domain";
import {
  createProjectSchema,
  projectIdSchema,
  renameProjectSchema,
} from "@/features/projects/schemas";
import {
  createProject,
  deleteProject,
  renameProject,
  setProjectStatus,
} from "@/features/projects/services";

/**
 * Reference actions.
 *
 * `defineWorkspaceAction` has already authenticated the caller, validated the
 * input and loaded the membership by the time a handler runs, so a handler
 * only expresses the role rule and the mutation.
 */

export const createProjectAction = defineWorkspaceAction({
  input: createProjectSchema,
  handler: async ({ input, ctx }) => {
    assertCanWrite(ctx.role);
    await createProject({
      workspaceId: ctx.workspaceId,
      name: input.name,
      description: input.description || undefined,
    });
    revalidatePath("/dashboard");
  },
});

export const renameProjectAction = defineWorkspaceAction({
  input: renameProjectSchema,
  handler: async ({ input, ctx }) => {
    assertCanWrite(ctx.role);
    await renameProject({
      workspaceId: ctx.workspaceId,
      projectId: input.projectId,
      name: input.name,
    });
    revalidatePath("/dashboard");
  },
});

export const archiveProjectAction = defineWorkspaceAction({
  input: projectIdSchema,
  handler: async ({ input, ctx }) => {
    assertCanWrite(ctx.role);
    await setProjectStatus({
      workspaceId: ctx.workspaceId,
      projectId: input.projectId,
      status: "archived",
    });
    revalidatePath("/dashboard");
  },
});

export const restoreProjectAction = defineWorkspaceAction({
  input: projectIdSchema,
  handler: async ({ input, ctx }) => {
    assertCanWrite(ctx.role);
    await setProjectStatus({
      workspaceId: ctx.workspaceId,
      projectId: input.projectId,
      status: "active",
    });
    revalidatePath("/dashboard");
  },
});

export const deleteProjectAction = defineWorkspaceAction({
  input: projectIdSchema,
  handler: async ({ input, ctx }) => {
    // Irreversible, so it takes more than the generic write gate.
    assertRole(ctx.role, "admin");
    await deleteProject({
      workspaceId: ctx.workspaceId,
      projectId: input.projectId,
    });
    revalidatePath("/dashboard");
  },
});
