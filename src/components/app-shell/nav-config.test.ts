import { describe, expect, it } from "vitest";
import {
  footerNavItems,
  getPageTitle,
  getPrefetchNavHrefs,
  isNavItemActive,
  mainNavItems,
} from "./nav-config";

describe("isNavItemActive", () => {
  it("matches the exact route", () => {
    expect(isNavItemActive("/dashboard", "/dashboard")).toBe(true);
  });

  it("matches nested routes", () => {
    expect(isNavItemActive("/settings/profile", "/settings")).toBe(true);
  });

  it("does not match a sibling sharing a prefix", () => {
    expect(isNavItemActive("/settings-legacy", "/settings")).toBe(false);
  });

  it("ignores the query string in the configured href", () => {
    expect(isNavItemActive("/dashboard", "/dashboard?tab=overview")).toBe(true);
  });

  it("does not treat root as a prefix of everything", () => {
    expect(isNavItemActive("/dashboard", "/")).toBe(false);
  });
});

describe("getPrefetchNavHrefs", () => {
  it("covers every configured destination exactly once", () => {
    const hrefs = getPrefetchNavHrefs();
    expect(new Set(hrefs).size).toBe(hrefs.length);
    for (const item of [...mainNavItems, ...footerNavItems]) {
      expect(hrefs).toContain(item.href);
    }
  });

  it("strips query strings so prefetch targets a route, not a view", () => {
    expect(getPrefetchNavHrefs().every((href) => !href.includes("?"))).toBe(true);
  });
});

describe("getPageTitle", () => {
  it("resolves the title of the active destination", () => {
    expect(getPageTitle("/dashboard")).toBe("Dashboard");
  });

  it("falls back when no destination matches", () => {
    expect(getPageTitle("/unknown", "App")).toBe("App");
  });
});
