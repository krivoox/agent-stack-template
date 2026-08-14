import { describe, expect, it } from "vitest";
import { ConflictError, ValidationError } from "@/domain";
import {
  assertCanArchive,
  assertCanRestore,
  assertNameAvailable,
  assertValidProjectName,
  normalizeProjectName,
  prepareProjectName,
  sortProjectsForList,
  type ProjectSummary,
} from "./project";

describe("normalizeProjectName", () => {
  it("trims and collapses internal whitespace", () => {
    expect(normalizeProjectName("  Website    redesign ")).toBe(
      "Website redesign",
    );
  });

  it("collapses newlines and tabs like any other whitespace", () => {
    expect(normalizeProjectName("Q1\n\tplanning")).toBe("Q1 planning");
  });
});

describe("assertValidProjectName", () => {
  it("accepts a name within bounds", () => {
    expect(() => assertValidProjectName("Ok")).not.toThrow();
  });

  it("rejects a name below the minimum", () => {
    expect(() => assertValidProjectName("A")).toThrow(ValidationError);
  });

  it("rejects a name above the maximum", () => {
    expect(() => assertValidProjectName("x".repeat(81))).toThrow(
      ValidationError,
    );
  });
});

describe("assertNameAvailable", () => {
  const existing = [
    { id: "1", name: "Website redesign" },
    { id: "2", name: "Mobile app" },
  ];

  it("allows a name nobody is using", () => {
    expect(() => assertNameAvailable(existing, "Data platform")).not.toThrow();
  });

  it("rejects a duplicate regardless of casing", () => {
    expect(() => assertNameAvailable(existing, "WEBSITE REDESIGN")).toThrow(
      ConflictError,
    );
  });

  it("lets a project keep its own name while renaming", () => {
    expect(() =>
      assertNameAvailable(existing, "Website redesign", "1"),
    ).not.toThrow();
  });
});

describe("prepareProjectName", () => {
  it("returns the normalised name", () => {
    expect(prepareProjectName("  New   project ", [])).toBe("New project");
  });

  it("detects a duplicate only after normalising", () => {
    expect(() =>
      prepareProjectName("  Mobile   app  ", [{ id: "2", name: "Mobile app" }]),
    ).toThrow(ConflictError);
  });

  it("validates length against the normalised name, not the raw input", () => {
    expect(() => prepareProjectName("  A  ", [])).toThrow(ValidationError);
  });
});

describe("status transitions", () => {
  it("archives an active project", () => {
    expect(() => assertCanArchive("active")).not.toThrow();
  });

  it("refuses to archive twice", () => {
    expect(() => assertCanArchive("archived")).toThrow(ConflictError);
  });

  it("restores an archived project", () => {
    expect(() => assertCanRestore("archived")).not.toThrow();
  });

  it("refuses to restore an active project", () => {
    expect(() => assertCanRestore("active")).toThrow(ConflictError);
  });
});

describe("sortProjectsForList", () => {
  const projects: ProjectSummary[] = [
    {
      id: "a",
      name: "Older active",
      status: "active",
      updatedAt: new Date("2026-01-01"),
    },
    {
      id: "b",
      name: "Archived recent",
      status: "archived",
      updatedAt: new Date("2026-03-01"),
    },
    {
      id: "c",
      name: "Newer active",
      status: "active",
      updatedAt: new Date("2026-02-01"),
    },
  ];

  it("puts active projects before archived ones", () => {
    expect(sortProjectsForList(projects).map((p) => p.id)).toEqual([
      "c",
      "a",
      "b",
    ]);
  });

  it("does not mutate the input", () => {
    const input = [...projects];
    sortProjectsForList(input);
    expect(input.map((p) => p.id)).toEqual(["a", "b", "c"]);
  });
});
