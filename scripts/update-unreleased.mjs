#!/usr/bin/env node
/**
 * Replaces the ## [Unreleased] section in CHANGELOG.md with git-cliff output.
 * Preserves dated release sections (baseline / tagged versions).
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const changelogPath = join(root, 'CHANGELOG.md');

let raw = '';
try {
  raw = execFileSync(
    'npx',
    ['git-cliff', '--unreleased', '--strip', 'header'],
    { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );
} catch (err) {
  console.error(err.stderr?.toString?.() || err.message);
  process.exit(1);
}

const trimmed = raw.trim();
// No conventional commits since last tag → empty Unreleased body
const unreleasedBlock = trimmed.startsWith('## [Unreleased]')
  ? trimmed
  : '## [Unreleased]';

const changelog = readFileSync(changelogPath, 'utf8');
const unreleasedStart = changelog.search(/^## \[Unreleased\]/m);
if (unreleasedStart === -1) {
  console.error('CHANGELOG.md is missing ## [Unreleased]');
  process.exit(1);
}

const afterUnreleased = changelog.slice(unreleasedStart);
const nextHeading = afterUnreleased.search(/^## \[[0-9]/m);
const before = changelog.slice(0, unreleasedStart);
const after =
  nextHeading === -1 ? '' : afterUnreleased.slice(nextHeading);

const next = `${before}${unreleasedBlock}\n\n${after}`.replace(/\n{3,}/g, '\n\n');
writeFileSync(changelogPath, next.endsWith('\n') ? next : `${next}\n`);
console.log(
  trimmed.startsWith('## [Unreleased]')
    ? 'Updated [Unreleased] in CHANGELOG.md'
    : 'Updated [Unreleased] in CHANGELOG.md (empty — no conventional commits yet)',
);
