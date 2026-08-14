import { z } from "zod";
import {
  PROJECT_NAME_MAX_LENGTH,
  PROJECT_NAME_MIN_LENGTH,
} from "@/features/projects/domain";

/**
 * Shape validation only. Uniqueness and status transitions need other rows or
 * current state, so they stay in the domain — a schema cannot express them.
 *
 * Every workspace-scoped schema carries `workspaceId`: `defineWorkspaceAction`
 * reads it to run the membership check.
 */

const workspaceScoped = { workspaceId: z.string().min(1) };

export const createProjectSchema = z.object({
  ...workspaceScoped,
  name: z
    .string()
    .min(PROJECT_NAME_MIN_LENGTH, "Give the project a name")
    .max(PROJECT_NAME_MAX_LENGTH, "That name is too long"),
  description: z.string().max(500).optional().or(z.literal("")),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const renameProjectSchema = z.object({
  ...workspaceScoped,
  projectId: z.string().min(1),
  name: z
    .string()
    .min(PROJECT_NAME_MIN_LENGTH, "Give the project a name")
    .max(PROJECT_NAME_MAX_LENGTH, "That name is too long"),
});

export type RenameProjectInput = z.infer<typeof renameProjectSchema>;

export const projectIdSchema = z.object({
  ...workspaceScoped,
  projectId: z.string().min(1),
});

export type ProjectIdInput = z.infer<typeof projectIdSchema>;
