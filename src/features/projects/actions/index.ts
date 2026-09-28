"use server";

import { revalidatePath } from "next/cache";

import { defineWorkspaceAction } from "@/lib/action";
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

export const createProjectAction = defineWorkspaceAction({
  input: createProjectSchema,
  minRole: "member",
  handler: async ({ input, ctx }) => {
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
  minRole: "member",
  handler: async ({ input, ctx }) => {
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
  minRole: "member",
  handler: async ({ input, ctx }) => {
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
  minRole: "member",
  handler: async ({ input, ctx }) => {
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
  minRole: "admin",
  handler: async ({ input, ctx }) => {
    await deleteProject({
      workspaceId: ctx.workspaceId,
      projectId: input.projectId,
    });
    revalidatePath("/dashboard");
  },
});
