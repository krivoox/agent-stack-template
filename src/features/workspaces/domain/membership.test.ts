import { describe, expect, it } from "vitest";
import { ConflictError, ForbiddenError, NotFoundError } from "@/domain";
import {
  applyTransferOwnership,
  assertCanDeleteWorkspace,
  assertCanManageMembers,
  assertCanWrite,
  assertNotRemovingLastOwner,
  assertRole,
  hasAtLeastRole,
  pickPreferredActiveWorkspace,
  type MembershipEntry,
} from "./membership";

const owner: MembershipEntry = { userId: "u-owner", role: "owner" };
const admin: MembershipEntry = { userId: "u-admin", role: "admin" };
const member: MembershipEntry = { userId: "u-member", role: "member" };

describe("role ranking", () => {
  it("orders roles by privilege", () => {
    expect(hasAtLeastRole("owner", "admin")).toBe(true);
    expect(hasAtLeastRole("admin", "admin")).toBe(true);
    expect(hasAtLeastRole("member", "admin")).toBe(false);
    expect(hasAtLeastRole("viewer", "member")).toBe(false);
  });
});

describe("assertCanWrite", () => {
  it("allows every role except viewer", () => {
    expect(() => assertCanWrite("owner")).not.toThrow();
    expect(() => assertCanWrite("admin")).not.toThrow();
    expect(() => assertCanWrite("member")).not.toThrow();
  });

  it("rejects viewers with a forbidden domain error", () => {
    expect(() => assertCanWrite("viewer")).toThrow(ForbiddenError);
  });
});

describe("assertRole", () => {
  it("passes when the role meets the minimum", () => {
    expect(() => assertRole("owner", "admin")).not.toThrow();
  });

  it("fails when the role is below the minimum", () => {
    expect(() => assertRole("member", "admin")).toThrow(ForbiddenError);
  });
});

describe("assertCanManageMembers", () => {
  it("requires at least admin", () => {
    expect(() => assertCanManageMembers("admin")).not.toThrow();
    expect(() => assertCanManageMembers("member")).toThrow(ForbiddenError);
  });
});

describe("assertCanDeleteWorkspace", () => {
  it("never allows deleting a personal workspace", () => {
    expect(() => assertCanDeleteWorkspace("owner", "personal")).toThrow(
      ConflictError,
    );
  });

  it("allows the owner to delete a group workspace", () => {
    expect(() => assertCanDeleteWorkspace("owner", "group")).not.toThrow();
  });

  it("rejects non-owners on a group workspace", () => {
    expect(() => assertCanDeleteWorkspace("admin", "group")).toThrow(
      ForbiddenError,
    );
  });
});

describe("assertNotRemovingLastOwner", () => {
  it("allows removing a non-owner", () => {
    expect(() =>
      assertNotRemovingLastOwner([owner, member], "u-member"),
    ).not.toThrow();
  });

  it("allows removing an owner while another owner remains", () => {
    const secondOwner: MembershipEntry = { userId: "u-2", role: "owner" };
    expect(() =>
      assertNotRemovingLastOwner([owner, secondOwner], "u-owner"),
    ).not.toThrow();
  });

  it("rejects removing the last owner", () => {
    expect(() =>
      assertNotRemovingLastOwner([owner, member], "u-owner"),
    ).toThrow(ConflictError);
  });

  it("rejects a user who is not a member", () => {
    expect(() => assertNotRemovingLastOwner([owner], "u-ghost")).toThrow(
      NotFoundError,
    );
  });
});

describe("applyTransferOwnership", () => {
  it("promotes the target and demotes the previous owner to admin", () => {
    const result = applyTransferOwnership([owner, member], "u-owner", "u-member");
    expect(result).toEqual([
      { userId: "u-owner", role: "admin" },
      { userId: "u-member", role: "owner" },
    ]);
  });

  it("does not mutate the input list", () => {
    const members = [owner, member];
    applyTransferOwnership(members, "u-owner", "u-member");
    expect(members).toEqual([owner, member]);
  });

  it("rejects transferring to yourself", () => {
    expect(() =>
      applyTransferOwnership([owner], "u-owner", "u-owner"),
    ).toThrow(ConflictError);
  });

  it("rejects a caller who is not the owner", () => {
    expect(() =>
      applyTransferOwnership([owner, admin], "u-admin", "u-owner"),
    ).toThrow(ForbiddenError);
  });

  it("rejects a target who is not a member", () => {
    expect(() =>
      applyTransferOwnership([owner], "u-owner", "u-ghost"),
    ).toThrow(NotFoundError);
  });
});

describe("pickPreferredActiveWorkspace", () => {
  it("returns null when no workspace remains", () => {
    expect(pickPreferredActiveWorkspace([])).toBeNull();
  });

  it("prefers the personal workspace", () => {
    const picked = pickPreferredActiveWorkspace([
      { id: "g1", type: "group" },
      { id: "p1", type: "personal" },
    ]);
    expect(picked).toBe("p1");
  });

  it("falls back to the first workspace when there is no personal one", () => {
    const picked = pickPreferredActiveWorkspace([
      { id: "g1", type: "group" },
      { id: "g2", type: "group" },
    ]);
    expect(picked).toBe("g1");
  });
});
