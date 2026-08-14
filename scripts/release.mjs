#!/usr/bin/env node
/**
 * Production release: SemVer bump from conventional commits + insert dated section.
 * Preserves existing CHANGELOG history (e.g. handcrafted 0.1.0 baseline).
 * Does not publish to npm. Git push / GitHub Release are CI's job.
 *
 * Usage:
 *   node scripts/release.mjs
 *   node scripts/release.mjs --dry-run
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const changelogPath = join(root, 'CHANGELOG.md');
const dryRun = process.argv.includes('--dry-run');

function sh(cmd, args) {
  return execFileSync(cmd, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

/** Resolve the public compare-link base from the git remote, not a hardcoded URL. */
function resolveRepoUrl() {
  try {
    const remote = sh('git', ['remote', 'get-url', 'origin']);
    // git@github.com:owner/repo.git  →  https://github.com/owner/repo
    // https://github.com/owner/repo.git → same without .git
    const ssh = remote.match(/^git@([^:]+):(.+?)(?:\.git)?$/);
    if (ssh) return `https://${ssh[1]}/${ssh[2]}`;
    const https = remote.match(/^(https?:\/\/[^/]+\/.+?)(?:\.git)?$/);
    if (https) return https[1];
  } catch {
    // No remote yet — links stay relative to whatever CI sets later.
  }
  return 'https://github.com/OWNER/REPO';
}

function hasReleaseTags() {
  try {
    sh('git', ['describe', '--tags', '--match', 'v[0-9]*', '--abbrev=0']);
    return true;
  } catch {
    return false;
  }
}

function previousTag() {
  try {
    return sh('git', ['describe', '--tags', '--match', 'v[0-9]*', '--abbrev=0']);
  } catch {
    return null;
  }
}

const REPO = resolveRepoUrl();
const pkgPath = join(root, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const current = pkg.version;

if (!hasReleaseTags()) {
  console.log(
    `No SemVer tags yet. First production tag v${current} is created by the Release workflow on main (bootstrap).`,
  );
  console.log(`Suggested tag: v${current}`);
  process.exit(0);
}

let nextTag;
try {
  nextTag = sh('npx', ['git-cliff', '--bumped-version']);
} catch (err) {
  const msg = err.stderr?.toString?.() || err.message || String(err);
  console.error('Could not compute bumped version:', msg);
  process.exit(1);
}

if (!nextTag) {
  console.error('git-cliff returned an empty bumped version');
  process.exit(1);
}

const nextVersion = nextTag.replace(/^v/, '');

if (nextVersion === current) {
  console.log(`No SemVer bump needed (still ${current}). Skipping.`);
  process.exit(0);
}

console.log(`Version: ${current} → ${nextVersion} (${nextTag})`);

if (dryRun) {
  process.exit(0);
}

const section = sh('npx', [
  'git-cliff',
  '--unreleased',
  '--tag',
  nextTag,
  '--strip',
  'header',
]);

if (!/^## \[/.test(section)) {
  console.error('git-cliff produced no release section:\n', section);
  process.exit(1);
}

pkg.version = nextVersion;
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

const changelog = readFileSync(changelogPath, 'utf8');
const unreleasedStart = changelog.search(/^## \[Unreleased\]/m);
if (unreleasedStart === -1) {
  console.error('CHANGELOG.md is missing ## [Unreleased]');
  process.exit(1);
}

const afterUnreleased = changelog.slice(unreleasedStart);
const nextHeading = afterUnreleased.search(/^## \[[0-9]/m);
const before = changelog.slice(0, unreleasedStart);
const older =
  nextHeading === -1 ? '' : afterUnreleased.slice(nextHeading);

const olderWithoutFooter = older.replace(/\n\[Unreleased\]:[\s\S]*$/m, '\n').trimEnd();

const prev = previousTag();
const footer = [
  '',
  `[Unreleased]: ${REPO}/compare/${nextTag}...HEAD`,
  prev
    ? `[${nextVersion}]: ${REPO}/compare/${prev}...${nextTag}`
    : `[${nextVersion}]: ${REPO}/releases/tag/${nextTag}`,
  `[0.1.0]: ${REPO}/releases/tag/v0.1.0`,
  '',
].join('\n');

const next = `${before}## [Unreleased]\n\n${section}\n\n${olderWithoutFooter}\n${footer}`;
writeFileSync(changelogPath, next.replace(/\n{3,}/g, '\n\n'));

console.log(`Updated package.json and CHANGELOG.md for ${nextTag}`);
console.log(nextTag);
