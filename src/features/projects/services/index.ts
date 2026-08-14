import "server-only";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/domain";
import {
  assertCanArchive,
  assertCanRestore,
  prepareProjectName,
  sortProjectsForList,
  type ProjectStatus,
} from "@/features/projects/domain";

/**
 * The service layer is the only place that talks to Prisma.
 *
 * Its job is to load what the domain needs, call the pure rules, and persist
 * the result. It never re-implements a rule, and it never decides what the
 * user sees — that is the action layer's job.
 */

export type ProjectListItem = {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  updatedAt: Date;
};

export async function listProjects(
  workspaceId: string,
): Promise<ProjectListItem[]> {
  const projects = await prisma.project.findMany({
    where: { workspaceId },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      updatedAt: true,
    },
  });

  return sortProjectsForList(
    projects.map((project) => ({
      ...project,
      status: project.status as ProjectStatus,
    })),
  );
}

export async function createProject(input: {
  workspaceId: string;
  name: string;
  description?: string;
}): Promise<{ id: string }> {
  const siblings = await prisma.project.findMany({
    where: { workspaceId: input.workspaceId },
    select: { id: true, name: true },
  });

  const name = prepareProjectName(input.name, siblings);

  return prisma.project.create({
    data: {
      workspaceId: input.workspaceId,
      name,
      description: input.description?.trim() || null,
    },
    select: { id: true },
  });
}

export async function renameProject(input: {
  workspaceId: string;
  projectId: string;
  name: string;
}): Promise<void> {
  const siblings = await prisma.project.findMany({
    where: { workspaceId: input.workspaceId },
    select: { id: true, name: true },
  });

  if (!siblings.some((project) => project.id === input.projectId)) {
    throw notFound();
  }

  const name = prepareProjectName(input.name, siblings, input.projectId);

  await prisma.project.update({
    where: { id: input.projectId },
    data: { name },
  });
}

export async function setProjectStatus(input: {
  workspaceId: string;
  projectId: string;
  status: ProjectStatus;
}): Promise<void> {
  // Scoping the read by workspaceId is what stops a caller from mutating a row
  // in a workspace they happen not to be a member of.
  const project = await prisma.project.findFirst({
    where: { id: input.projectId, workspaceId: input.workspaceId },
    select: { status: true },
  });
  if (!project) throw notFound();

  const current = project.status as ProjectStatus;
  if (input.status === "archived") assertCanArchive(current);
  else assertCanRestore(current);

  await prisma.project.update({
    where: { id: input.projectId },
    data: { status: input.status },
  });
}

export async function deleteProject(input: {
  workspaceId: string;
  projectId: string;
}): Promise<void> {
  const { count } = await prisma.project.deleteMany({
    where: { id: input.projectId, workspaceId: input.workspaceId },
  });
  if (count === 0) throw notFound();
}

function notFound(): NotFoundError {
  return new NotFoundError("project.not_found", "That project no longer exists.");
}
