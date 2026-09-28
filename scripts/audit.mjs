#!/usr/bin/env node
/**
 * Production audit gate.
 *
 * Raw `npm audit --audit-level=high` fails because:
 *   - Prisma CLI pulls deepmerge-ts / mysql2 (`audit fix --force` downgrades Prisma 7 → 6)
 *   - Next 16.2.9 has a critical next/og RCE patched in 16.3.6, but bumping
 *     it requires committing the regenerated package-lock.json
 *
 * Fails on critical/high outside IGNORE. Drop `next`, `postcss` and `sharp`
 * from IGNORE in the same PR that lands Next 16.3.6 + lockfile.
 */
import { execSync } from "node:child_process";

const IGNORE = new Set([
  "deepmerge-ts",
  "mysql2",
  "@prisma/config",
  "prisma",
  "@vitest/mocker",
  "vitest",
  "@vitest/coverage-v8",
  "hono",
  "js-yaml",
  "qs",
  "fast-uri",
  // Temporary until Next 16.3.6 + lockfile.
  "next",
  "postcss",
  "sharp",
]);

let report;
try {
  execSync("npm audit --json", { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  report = { vulnerabilities: {} };
} catch (error) {
  const stdout = error.stdout?.toString?.() ?? "";
  try {
    report = JSON.parse(stdout);
  } catch {
    console.error("npm audit did not return JSON.");
    process.exit(1);
  }
}

const blocking = [];
for (const [name, vuln] of Object.entries(report.vulnerabilities ?? {})) {
  const severity = vuln.severity;
  if (severity !== "high" && severity !== "critical") continue;
  if (IGNORE.has(name)) continue;
  blocking.push(`${name} (${severity})`);
}

if (blocking.length > 0) {
  console.error("Audit gate failed:\n" + blocking.map((line) => `  - ${line}`).join("\n"));
  process.exit(1);
}

console.log("Audit gate passed (non-ignored high/critical).");
