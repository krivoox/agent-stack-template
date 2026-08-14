import { describe, expect, it } from "vitest";
import { initialsFor, isValidTimezone, resolveDisplayName } from "./profile";

describe("isValidTimezone", () => {
  it("accepts IANA identifiers", () => {
    expect(isValidTimezone("UTC")).toBe(true);
    expect(isValidTimezone("America/New_York")).toBe(true);
  });

  it("rejects unknown or empty values", () => {
    expect(isValidTimezone("Mars/Olympus_Mons")).toBe(false);
    expect(isValidTimezone("   ")).toBe(false);
  });
});

describe("resolveDisplayName", () => {
  it("prefers the explicit display name", () => {
    expect(
      resolveDisplayName({
        displayName: "Ada",
        name: "Ada Lovelace",
        email: "ada@example.com",
      }),
    ).toBe("Ada");
  });

  it("ignores a blank display name", () => {
    expect(
      resolveDisplayName({
        displayName: "   ",
        name: "Ada Lovelace",
        email: "ada@example.com",
      }),
    ).toBe("Ada Lovelace");
  });

  it("falls back to the local part of the email", () => {
    expect(
      resolveDisplayName({ displayName: null, name: null, email: "ada@example.com" }),
    ).toBe("ada");
  });
});

describe("initialsFor", () => {
  it("uses at most two initials", () => {
    expect(initialsFor("Ada Byron Lovelace")).toBe("AB");
  });

  it("degrades to a placeholder rather than an empty string", () => {
    expect(initialsFor("   ")).toBe("?");
  });
});
