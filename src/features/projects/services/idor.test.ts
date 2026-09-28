import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Services are server-only. Vitest has no RSC boundary, so the package
 * throws unless we stub it. Prisma is mocked — this suite only checks that
 * writes are scoped by workspaceId.
 */
vi.mock("server-only", () => ({}));

const findFirst = vi.fn();
const deleteMany = vi.fn();
const update = vi.fn();
const findMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: {
      findFirst,
      findMany,
      deleteMany,
      update,
    },
  },
}));

import { deleteProject, renameProject, setProjectStatus } from "./index";
import { NotFoundError } from "@/domain";

describe("project service IDOR", () => {
  beforeEach(() => {
    findFirst.mockReset();
    deleteMany.mockReset();
    update.mockReset();
    findMany.mockReset();
  });

  it("rename of a project in another workspace is not_found", async () => {
    findMany.mockResolvedValue([]);
    await expect(
      renameProject({
        workspaceId: "ws-a",
        projectId: "proj-from-ws-b",
        name: "Hijack",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(update).not.toHaveBeenCalled();
  });

  it("status change scopes the read by workspaceId", async () => {
    findFirst.mockResolvedValue(null);
    await expect(
      setProjectStatus({
        workspaceId: "ws-a",
        projectId: "proj-from-ws-b",
        status: "archived",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "proj-from-ws-b", workspaceId: "ws-a" },
      }),
    );
    expect(update).not.toHaveBeenCalled();
  });

  it("delete of a foreign workspace id affects 0 rows", async () => {
    deleteMany.mockResolvedValue({ count: 0 });
    await expect(
      deleteProject({ workspaceId: "ws-a", projectId: "proj-from-ws-b" }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(deleteMany).toHaveBeenCalledWith({
      where: { id: "proj-from-ws-b", workspaceId: "ws-a" },
    });
  });
});
