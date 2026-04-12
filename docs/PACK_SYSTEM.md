# Pack System

This document describes the product-level pack workflow in Code Abyss.

## Purpose

The pack system lets a repository declare AI workflow extensions once and then keep Claude/Codex installations synchronized with minimal user effort.

The system has four main flows:

1. `install`
2. `bootstrap`
3. `vendor`
4. `report`

## Core concepts

### Core pack vs external pack

- `abyss`: bundled core pack, always installed by the main installer
- external packs (for example `gstack`): declared in `.code-abyss/packs.lock.json`

### Host roots

- Claude: `~/.claude/`
- Codex: `~/.codex/` plus `~/.agents/`
- Gemini: `~/.gemini/`

### Project declaration

The nearest `.code-abyss/packs.lock.json` controls host-specific pack behavior:

- `required`
- `optional`
- `optional_policy`
- `sources`

See [PACKS_LOCK_SCHEMA.md](/home/telagod/project/code-abyss/docs/PACKS_LOCK_SCHEMA.md).

### Pack contract

Each pack is declared by `packs/<name>/manifest.json`.

See [PACK_MANIFEST_SCHEMA.md](/home/telagod/project/code-abyss/docs/PACK_MANIFEST_SCHEMA.md).

## Flow 1: Install

Entry point:

```bash
npx code-abyss --target claude -y
npx code-abyss --target codex -y
npx code-abyss --target gemini -y
```

What happens:

1. Install bundled `abyss` host files
2. Read nearest `packs.lock`
3. Select external packs by `required/optional/optional_policy`
4. Resolve each pack source by `sources.<pack>`
5. Install runtime artifacts for the target host
6. Write install report JSON to `.code-abyss/reports/` when inside a project
7. Refresh bootstrap snippets; if docs already contain managed markers, update them in place

### Source fallback

For packs that support it:

- `local` prefers `.code-abyss/vendor/<pack>`
- if local source is missing, main install may fall back to `pinned`
- `disabled` skips install but preserves declaration

## Flow 2: Bootstrap

Entry point:

```bash
npm run packs:bootstrap
npm run packs:bootstrap -- --apply-docs
```

What happens:

1. Build default lock from pack manifests
2. Apply requested CLI mutations
3. Validate the lock
4. Write `.code-abyss/packs.lock.json`
5. Generate snippet files under `.code-abyss/snippets/`
6. Optionally inject/update managed sections in `README.md` and `CONTRIBUTING.md`

## Flow 3: Vendor

Entry points:

```bash
npm run packs:vendor:pull -- gstack
npm run packs:vendor:sync
npm run packs:vendor:sync -- --check
npm run packs:vendor:status -- gstack
npm run packs:vendor:dirty -- gstack
```

### Provider model

Vendor sync now supports provider abstraction:

- `git`
- `local-dir`
- `archive`

Each provider must support:

1. validation
2. sync
3. status

The registry lives in `bin/lib/vendor-providers/`.

### Drift semantics

Vendor status reports:

- `exists`
- `dirty`
- `drifted`
- `currentCommit`
- `targetCommit`
- `sourceExists`

`vendor-sync --check` is the CI-safe gate for local-source packs.

## Flow 4: Report

Entry points:

```bash
npm run packs:report -- list
npm run packs:report -- latest --kind install-codex
npm run packs:report -- summary
npm run packs:report -- summary --json
```

Reports are written to:

```text
.code-abyss/reports/
```

Current artifact families:

- `install-claude-*`
- `install-codex-*`
- `install-gemini-*`
- `pack-uninstall-<artifactPrefix>-*`

### Summary view

`report summary` shows the newest artifact per report kind and prints a concise operational view of:

- target installs
- pack install statuses
- pack uninstall actions

`report summary --json` emits the same model in machine-readable form for higher-level TUI/HTML renderers.

## Uninstall

Pack uninstall is manifest-driven:

```bash
npm run packs:uninstall -- gstack --host all --remove-lock --remove-vendor
```

The uninstall flow reads `hosts.<host>.uninstall` from the pack manifest and removes:

- runtime roots
- derived command files
- optional vendor directories
- optional lock references

It also writes a dedicated uninstall report artifact.

## Design intent

The pack system is meant to keep the **user-facing path simple**:

- main install remains `code-abyss --target ...`
- pack complexity stays behind `packs.lock`, manifests, vendor cache, and reports
- repositories can opt into more automation without requiring every contributor to learn the internals first

## Extensibility

- vendor providers are loaded from `bin/lib/vendor-providers/` plus optional project-local provider directories
- pack manifests are validated before use
- `packs.lock` controls per-host behavior
- report artifacts provide a stable integration point for richer UI surfaces

## Current boundaries

- only some packs expose full uninstall metadata
- provider abstraction currently covers local sources and vendored upstream sync, not remote tarball download
- reports are file-based artifacts, not yet a full dashboard
