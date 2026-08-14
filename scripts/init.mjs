#!/usr/bin/env node
/**
 * One-shot identity rewrite for a fresh clone of this template.
 *
 *   node scripts/init.mjs --name "My App" --slug my-app
 *   node scripts/init.mjs --name "My App" --slug my-app --repo owner/my-app
 *
 * Rewrites APP_NAME / package.json / a handful of docs titles. Does not touch
 * domain code — that is product work, not renaming.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function arg(flag) {
  const i = process.argv.indexOf(flag);
  if (i === -1) return undefined;
  const value = process.argv[i + 1];
  if (!value || value.startsWith('--')) {
    console.error(`Missing value for ${flag}`);
    process.exit(1);
  }
  return value;
}

function usage() {
  console.log(`Usage:
  node scripts/init.mjs --name "My App" --slug my-app [--description "..."] [--repo owner/name]

Options:
  --name          Display name (APP_NAME, auth appName, titles)
  --slug          npm package name / short id (kebab-case)
  --description   One-line product description
  --repo          Optional GitHub "owner/name" — creates the repo and pushes
  --private       Create the GitHub repo as private (default: public)
`);
}

const name = arg('--name');
const slug = arg('--slug');
const description =
  arg('--description') ??
  'A multi-tenant web application built from the agent stack template.';
const repo = arg('--repo');
const isPrivate = process.argv.includes('--private');

if (!name || !slug) {
  usage();
  process.exit(1);
}

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error(`--slug must be kebab-case (got "${slug}")`);
  process.exit(1);
}

const shortName = name.length <= 12 ? name : name.split(/\s+/)[0] ?? name;

function replaceIn(path, replacements) {
  const full = join(root, path);
  if (!existsSync(full)) {
    console.warn(`skip (missing): ${path}`);
    return;
  }
  let text = readFileSync(full, 'utf8');
  for (const [from, to] of replacements) {
    text = text.split(from).join(to);
  }
  writeFileSync(full, text);
  console.log(`updated ${path}`);
}

// ─── app-config ──────────────────────────────────────────────────────────────
{
  const path = join(root, 'src/lib/app-config.ts');
  let text = readFileSync(path, 'utf8');
  text = text
    .replace(/APP_NAME = "[^"]*"/, `APP_NAME = ${JSON.stringify(name)}`)
    .replace(
      /APP_SHORT_NAME = "[^"]*"/,
      `APP_SHORT_NAME = ${JSON.stringify(shortName)}`,
    )
    .replace(
      /APP_DESCRIPTION = "[^"]*"/,
      `APP_DESCRIPTION = ${JSON.stringify(description)}`,
    );
  writeFileSync(path, text);
  console.log('updated src/lib/app-config.ts');
}

// ─── package.json ────────────────────────────────────────────────────────────
{
  const path = join(root, 'package.json');
  const pkg = JSON.parse(readFileSync(path, 'utf8'));
  pkg.name = slug;
  writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log('updated package.json');
}

// ─── string replacements across docs / auth ──────────────────────────────────
const replacements = [
  ['Agent Stack Template', name],
  ['agent-stack-template', slug],
];

for (const file of [
  'AGENTS.md',
  'README.md',
  'src/lib/auth.ts',
  'docs/README.md',
]) {
  replaceIn(file, replacements);
}

console.log(`
Identity set:
  name:        ${name}
  short name:  ${shortName}
  slug:        ${slug}
  description: ${description}
`);

if (!repo) {
  console.log('Next: cp .env.example .env.local && npm install && npm run db:migrate');
  process.exit(0);
}

if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) {
  console.error(`--repo must look like owner/name (got "${repo}")`);
  process.exit(1);
}

try {
  execFileSync('gh', ['--version'], { stdio: 'ignore' });
} catch {
  console.error('GitHub CLI (gh) is required for --repo. Install: https://cli.github.com');
  process.exit(1);
}

console.log(`Creating ${isPrivate ? 'private' : 'public'} repository ${repo}…`);
try {
  execFileSync(
    'gh',
    [
      'repo',
      'create',
      repo,
      isPrivate ? '--private' : '--public',
      '--source=.',
      '--remote=origin',
      '--push',
    ],
    { cwd: root, stdio: 'inherit' },
  );
} catch (err) {
  // Repo may already exist, or git may not be initialised yet.
  console.error(err.message ?? err);
  console.log(`
If the repo already exists, wire it manually:

  git init
  git add .
  git commit -m "chore: initial commit from agent-stack-template"
  git branch -M main
  git remote add origin git@github.com:${repo}.git
  git push -u origin main
  git checkout -b develop && git push -u origin develop
`);
  process.exit(1);
}

console.log(`
Remote ready: https://github.com/${repo}

Create the integration branch:

  git checkout -b develop
  git push -u origin develop
`);
