#!/usr/bin/env node
'use strict';

// scripts/sync-mythos.js
// Vendors the mythos discipline KERNEL into code-abyss as committed real files.
//
// WHY a sync script and not a git submodule:
//   code-abyss ships to users as an npm tarball (`npx code-abyss`). npm pack does NOT
//   populate git submodules — a submodule would ship EMPTY, so the kernel would be
//   missing for every installed user. The kernel therefore MUST live in-tree as real,
//   committed files under skills/_kernel/ (package.json "files" already includes skills/).
//   mythos stays the single source of truth for RULE CONTENT; this script is the one-way
//   consume path. Run it at dev time, then commit skills/_kernel/.
//
// What it does:
//   1. Copies the 9 mythos bundle dirs verbatim into skills/_kernel/<bundle>/.
//      English rule text is preserved byte-for-byte (no translation, kernel is English).
//   2. Injects `user-invocable: false` into each bundle SKILL.md frontmatter if absent —
//      code-abyss's skill-registry contract (bin/lib/skill-registry.js:84) HARD-REQUIRES
//      this field or command generation throws. mythos SKILL.md ships only name+description.
//      This transform is exactly why a submodule cannot work: you cannot rewrite a
//      submodule's checked-out files without forking upstream.
//   3. Writes skills/_kernel/.sync-meta.json provenance (source path + git commit + time)
//      so the vendored copy is traceable back to a mythos revision (single-source audit).
//
// Usage:
//   MYTHOS_DIR=/path/to/mythos node scripts/sync-mythos.js
//   (defaults to ../mythos relative to the code-abyss repo root)

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const MYTHOS_DIR = process.env.MYTHOS_DIR
  ? path.resolve(process.env.MYTHOS_DIR)
  : path.resolve(REPO_ROOT, '..', 'mythos');
const KERNEL_DIR = path.join(REPO_ROOT, 'skills', '_kernel');

const BUNDLES = [
  'doctrine', 'methods', 'character', 'loop-engineering',
  'frontend', 'backend', 'hardware', 'ml', 'security',
];

// Never carry these into the shipped kernel.
const EXCLUDE = new Set(['.git', '.backup', '__pycache__', '.DS_Store', 'Thumbs.db']);
function copyFilter(src) {
  const base = path.basename(src);
  if (EXCLUDE.has(base)) return false;
  if (base.endsWith('.pyc') || base.endsWith('.pyo')) return false;
  return true;
}

function fail(msg) {
  console.error(`sync-mythos: ${msg}`);
  process.exit(1);
}

function ensureInvocableField(skillMdPath, bundle) {
  const content = fs.readFileSync(skillMdPath, 'utf8');
  const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) fail(`${bundle}/SKILL.md has no frontmatter block`);
  if (/^user-invocable\s*:/m.test(fm[1])) return false; // already present, idempotent
  // Inject `user-invocable: false`: skill-registry.js requires the field to
  // exist, but kernel bundles are NOT user slash-commands — they are invoked by
  // the always-on router + their SKILL.md description (mythos's self-invocation
  // model). false keeps them out of command generation (no /doctrine … noise)
  // and out of the invocable-skill scan (persona-architecture-v3.md §4).
  const patched = content.replace(/^(---\r?\n)/, `$1user-invocable: false\n`);
  fs.writeFileSync(skillMdPath, patched);
  return true;
}

function mythosCommit() {
  try {
    return execFileSync('git', ['-C', MYTHOS_DIR, 'rev-parse', 'HEAD'], {
      encoding: 'utf8',
    }).trim();
  } catch {
    return 'unknown';
  }
}

function main() {
  if (!fs.existsSync(MYTHOS_DIR)) {
    fail(`mythos source not found at ${MYTHOS_DIR} (set MYTHOS_DIR=...)`);
  }
  for (const b of BUNDLES) {
    if (!fs.existsSync(path.join(MYTHOS_DIR, b, 'SKILL.md'))) {
      fail(`missing bundle: ${path.join(MYTHOS_DIR, b, 'SKILL.md')}`);
    }
  }

  fs.rmSync(KERNEL_DIR, { recursive: true, force: true });
  fs.mkdirSync(KERNEL_DIR, { recursive: true });

  let patched = 0;
  for (const b of BUNDLES) {
    const srcDir = path.join(MYTHOS_DIR, b);
    const destDir = path.join(KERNEL_DIR, b);
    fs.cpSync(srcDir, destDir, { recursive: true, filter: copyFilter });
    if (ensureInvocableField(path.join(destDir, 'SKILL.md'), b)) patched++;
    console.log(`  vendored ${b}/`);
  }

  // Overlay code-abyss-authored kernel-hook integration files into the vendored
  // tree. They live at scripts/kernel-hooks/ (outside skills/_kernel/, which we
  // just wiped) so they survive re-sync, and are copied in beside the vendored
  // check_banned_openers.py so the installer self-locates via SCRIPT_DIR.
  let overlaid = 0;
  const overlaySrc = path.join(__dirname, 'kernel-hooks');
  if (fs.existsSync(overlaySrc)) {
    const charHooks = path.join(KERNEL_DIR, 'character', 'hooks');
    fs.mkdirSync(charHooks, { recursive: true });
    for (const f of fs.readdirSync(overlaySrc)) {
      const src = path.join(overlaySrc, f);
      if (!fs.statSync(src).isFile()) continue;
      const dest = path.join(charHooks, f);
      fs.copyFileSync(src, dest);
      if (f.endsWith('.sh')) fs.chmodSync(dest, 0o755);
      overlaid++;
    }
    console.log(`  overlaid ${overlaid} kernel-hook file(s) into character/hooks/`);
  }

  const meta = {
    source: MYTHOS_DIR,
    sourceCommit: mythosCommit(),
    bundles: BUNDLES,
    userInvocablePatched: patched,
    syncedAt: new Date().toISOString(),
    note: 'Generated by scripts/sync-mythos.js. Do not hand-edit; edit mythos upstream and re-sync.',
  };
  fs.writeFileSync(
    path.join(KERNEL_DIR, '.sync-meta.json'),
    JSON.stringify(meta, null, 2) + '\n'
  );

  console.log(
    `sync-mythos: ${BUNDLES.length} bundles -> skills/_kernel/ ` +
    `(commit ${meta.sourceCommit.slice(0, 8)}, ${patched} SKILL.md patched). ` +
    `Now: git add skills/_kernel && npm run verify:skills`
  );
}

main();
