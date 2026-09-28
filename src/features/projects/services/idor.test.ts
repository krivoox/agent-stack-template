import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Services are server-only. Vitest has no RSC boundary, so the package
 * throws unless we stub it. Prisma is mocked — this suite only checks that
 * writes are scoped by workspaceId.
 *
 * Factories passed to vi.mock are hoisted: any spies they close over must
 * come from vi.hoisted, not from a later const.
 */
vi.mock("server-only", () => ({}));

const prismaMocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  deleteMany: vi.fn(),
  update: vi.fn(),
  findMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: {
      findFirst: prismaMocks.findFirst,
      findMany: prismaMocks.findMany,
      deleteMany: prismaMocks.deleteMany,
      update: prismaMocks.update,
    },
  },
}));

import { deleteProject, renameProject, setProjectStatus } from "./index";
import { NotFoundError } from "@/domain";

describe("project service IDOR", () => {
  beforeEach(() => {
    prismaMocks.findFirst.mockReset();
    prismaMocks.deleteMany.mockReset();
    prismaMocks.update.mockReset();
    prismaMocks.findMany.mockReset();
  });

  it("rename of a project in another workspace is not_found", async () => {
    prismaMocks.findMany.mockResolvedValue([]);
    await expect(
      renameProject({
        workspaceId: "ws-a",
        projectId: "proj-from-ws-b",
        name: "Hijack",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(prismaMocks.update).not.toHaveBeenCalled();
  });

  it("status change scopes the read by workspaceId", async () => {
    prismaMocks.findFirst.mockResolvedValue(null);
    await expect(
      setProjectStatus({
        workspaceId: "ws-a",
        projectId: "proj-from-ws-b",
        status: "archived",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(prismaMocks.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "proj-from-ws-b", workspaceId: "ws-a" },
      }),
    );
    expect(prismaMocks.update).not.toHaveBeenCalled();
  });

  it("delete of a foreign workspace id affects 0 rows", async () => {
    prismaMocks.deleteMany.mockResolvedValue({ count: 0 });
    await expect(
      deleteProject({ workspaceId: "ws-a", projectId: "proj-from-ws-b" }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(prismaMocks.deleteMany).toHaveBeenCalledWith({
      where: { id: "proj-from-ws-b", workspaceId: "ws-a" },
    });
  });
});
