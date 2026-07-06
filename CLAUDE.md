# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Code Abyss is an npm package that installs persona configuration plus proactive execution guidance into Claude Code, Codex CLI, Gemini CLI, and OpenClaw. It delivers: persona rules, 6 switchable output styles, 30 domain skills, 5 executable verification/generation tools, and a lazily-loaded discipline kernel (9 judgment bundles under `skills/_kernel/` — `verify:skills` validates 39 total). See Architecture below for how the kernel composes with persona/style.

## Commands

```bash
npm test                          # Run Jest test suite
npm run verify:skills             # Validate all SKILL.md frontmatter contracts (fail-fast gate)
npm run kernel:sync               # Re-vendor skills/_kernel/ from $MYTHOS_DIR (default ../mythos) — wipes and rebuilds
npm run persona:sync-scenarios    # Regenerate core personas' 情景剧本 tables from persona-card.json; --check for CI drift gate
node bin/install.js --help        # Installer CLI help
node bin/install.js --target claude -y   # Zero-config install to ~/.claude/
node bin/install.js --target codex -y    # Zero-config install to ~/.codex/
node bin/install.js --target gemini -y   # Zero-config install to ~/.gemini/
node bin/install.js --target openclaw -y # Zero-config install to ~/.openclaw/
node bin/install.js --list-styles        # List available output styles
```

Running individual verify tools directly:
```bash
node skills/analyzing-security/scripts/security_scanner.js <path>
node skills/verifying-modules/scripts/module_scanner.js <path>
node skills/analyzing-changes/scripts/change_analyzer.js --mode staged|working
node skills/checking-code-quality/scripts/quality_checker.js <path>
node skills/generating-docs/scripts/doc_generator.js <path>
```

Running a single test file:
```bash
npx jest test/install-registry.test.js --runInBand
```

### Persona behavioral battery (opt-in eval)

`scripts/persona-battery/` measures whether an installed persona's responses actually honor
kernel precedence (correctness > voice, no capitulation openers, security authorization
gates, etc. — `skills/_kernel/`) across 10 behavioral probes (`probes.json`). This is a
small honest smoke battery, not a calibrated statistical eval (10 cases, not the 50-200+ a
rigorous eval needs) — treat results as a spot-check, not a certified score.

Two steps, both cost real API calls and need the `claude` CLI logged in (or
`ANTHROPIC_API_KEY` set):

```bash
node scripts/persona-battery/capture-transcript.js --persona abyss --style <slug> --out /tmp/transcript.json
node -e "
  const { run } = require('./scripts/persona-battery/run.js');
  const { claudeJudge } = require('./scripts/persona-battery/judge.js');
  run({ transcriptPath: '/tmp/transcript.json', judge: claudeJudge });
"
```

`capture-transcript.js` is scoped to the `claude` target only (no verified headless
contract exists for Codex/Gemini/OpenClaw yet) — for those, manually paste each probe's
`situation` into a fresh session and build the transcript JSON (`{probeId: responseText}`)
by hand. `run.js` alone (`npm run battery:persona -- --transcript <path>`) will still
mechanically score the 4 banned-opener probes without a judge; everything else stays
`UNSCORED` (never faked as a pass) until a judge is wired in.

Deliberately **not** part of `npm test` or the push/PR CI gate (real cost, LLM
non-determinism, no API key secret in this repo's default CI) — it runs only via the
manual `persona-battery.yml` `workflow_dispatch` job.

## CI / CD

Four GitHub Actions workflows:

| Workflow | Trigger | Jobs |
|----------|---------|------|
| **ci.yml** | push/PR to main | `test` (Node 18/20/22) + `smoke-{claude,codex,gemini,openclaw}` (ubuntu/macos/windows) — 15 jobs total |
| **release.yml** | GitHub Release published | Checkout tag → verify tag=package.json version → test → verify:skills → `npm publish --provenance` |
| **pages.yml** | push to main (site/** changed) | Deploy `site/` to GitHub Pages |
| **persona-battery.yml** | manual (`workflow_dispatch`) | Capture transcript + score persona behavioral battery — skips (not fails) without `ANTHROPIC_API_KEY` secret |

### Release process

1. Bump `package.json` version + update `CHANGELOG.md` on a `release/vX.Y.Z` branch
2. Create PR, wait for CI green (15 jobs), merge
3. `git tag vX.Y.Z && git push origin vX.Y.Z`
4. `gh release create vX.Y.Z --title "..." --notes "..."` — this triggers `release.yml` which auto-publishes to npm
5. **Do NOT run `npm publish` manually** — the release workflow handles it with `--provenance` and `NPM_TOKEN` secret

CI gate per PR: `npm ci && npm test && npm run verify:skills` plus `packs:check`, `packs:vendor:sync --check`, `sync-persona-scenarios.js --check`, the `@inquirer/*` dependency-resolution smoke check, all 4 verify tools, and smoke install/uninstall across 4 targets × 3 OS.

## Architecture

### Runtime Composition (persona-architecture v3 — eager→lazy)

v2's always-on core baked identity + an 8-file behavior engine + style into every render,
pinning an 8000-char budget ceiling with zero headroom. v3 inverts this: the always-on core
shrinks to the minimum, everything else (the discipline kernel, generic behavior/method
content) becomes lazy — invoked by a thin router or a skill's own description, not baked in.
See `docs/design/persona-architecture-v3.md` for the full redesign.

| Layer | Source | Loaded |
|-------|--------|--------|
| Identity | `config/personas/*.md` | Always-on — per-persona role, tone, scenario table (see Persona Scenario Single-Source below) |
| Shared core | `config/personas/_shared/{iron-laws,injection-awareness,kernel-router,skill-routing,proactive,environment}.md` | Always-on — `SHARED_FILES_ORDER` in `bin/lib/style-registry.js`; `proactive.md` here is trimmed to only code-abyss's own sedimentation triggers, not generic behavior |
| Discipline kernel | `skills/_kernel/*/SKILL.md` (9 bundles) | **Lazy** — invoked by `kernel-router.md`'s dispatch table or the bundle's own SKILL.md description, never rendered into every prompt. See Discipline Kernel below |
| Output Style | `output-styles/*.md` + `index.json` | Always-on — style registry + per-style templates with `{{self}}`/`{{user}}`/`{{language}}` template variables |

All four targets use a single composition function `renderRuntimeGuidance()` (`bin/lib/style-registry.js`) that assembles, in order: identity → shared core → examples (optional) → style → posthistory (optional) → a **kernel precedence anchor**, a fixed closing string asserting the kernel wins any conflict with voice/style. The anchor is deliberately positioned *last* so it wins position bias even against a persona's highest-weight posthistory instruction. Persona registry `config/personas/index.json` declares `self`/`user`/`language` fields per persona for cross-combination safety. Current max render across all persona×style combinations: ~7695 chars, comfortably under the 8000 cap (verify via `test/style-registry.test.js`'s budget assertion).

### Discipline Kernel (`skills/_kernel/`)

Nine bundles of engineering judgment — `doctrine`, `methods`, `character`, `loop-engineering`
(cross-cutting) plus `backend`, `frontend`, `hardware`, `ml`, `security` (domain) — vendored
**in-tree** (not a git submodule: `npm pack` ships no submodule content) from a sibling
`mythos` project via `npm run kernel:sync` (`scripts/sync-mythos.js`). The sync script wipes
and rebuilds `skills/_kernel/` wholesale from `$MYTHOS_DIR` (default `../mythos`) each run —
**do not hand-edit files under `skills/_kernel/` directly**, edits are lost on next sync;
`scripts/kernel-hooks/*` is the one exception (lives outside the wiped tree, overlaid back in
after each sync). Kernel `SKILL.md`s are forced `user-invocable: false` by the sync script —
they're router/description-invoked judgment, not user-facing slash commands.

Two ways this is enforced rather than aspirational:
- **`--with-enforcement`** (`bin/install.js`'s `maybeInstallEnforcement()`, claude/codex only)
  installs the `character` bundle's Stop-hook backstop (`install-character-hooks.sh` →
  `check_banned_openers.py`) — blocks and forces one revision turn if a reply opens with a
  banned capitulation phrase ("you're absolutely right", etc.). Deliberately a separate flag
  from the deprecated `--with-hooks` (that gates the non-blocking abyss code-graph hooks).
- **`scripts/persona-battery/`** — an opt-in behavioral eval, not a unit test; see
  "Persona behavioral battery" above.

**Domain-routing compose** (`scripts/wire-domain-gates.js`): 16 exec skills carry a one-line
"judgment before execution" pointer into their matching kernel domain bundle (backend×5,
frontend×2, hardware×2, ml×1, security×6) — the kernel bundle decides *whether/what/tradeoffs*,
the exec skill still owns *how*. Lives on the exec-skill side (code-abyss-owned), not inside
`skills/_kernel/` itself, since that tree gets wiped on every sync.

### Persona Scenario Single-Source (`scripts/sync-persona-scenarios.js`)

Each core persona's `persona-card.json` `scenarios[]` (name/triggers/chain/priority, plus
`triggers_zh`/`chain_zh` display-text fields) is the single source for its rendered `.md`
`## 情景剧本` table — `scripts/sync-persona-scenarios.js` generates the table from the card;
`--check` mode (wired into CI) fails if the committed `.md` would differ from a fresh
regeneration. This exists because the two representations drifted once for real (a card
scenario went missing from the md) — the regeneration-diff test in
`test/style-registry.test.js` catches full-content drift (order, triggers, chain, priority),
not just the scenario-name-set check the original guard used. Note `persona-card.json.scenarios`
is **not** read by `renderRuntimeGuidance()` at all — only 5 scalar fields (`display_name`,
`description`, `voice.self/user/language`) feed the runtime render; scenario generation is a
dev-time/CI concern, not a runtime one.

### Persona Loading (Core + Remote)

Only the **core persona** (`abyss`) ships with the npm package. All other personas are **remote** — fetched from GitHub raw on first use and cached at `~/.code-abyss/personas/<slug>/`.

`config/personas/index.json` has two entry types:
- **Core** (`core: true`): metadata derived from `persona-card.json` at load time
- **Remote** (`core: false`): snapshot metadata inline (label, description, self, user, language) for offline selection prompt; full content fetched on demand

`bin/lib/persona-fetch.js` handles HTTPS fetch + local cache. `bin/lib/style-registry.js` path resolution is cache-aware: checks local `config/personas/` first (repo dev mode), falls back to `~/.code-abyss/personas/` (npm package mode). `bin/lib/select.js` triggers `ensureRemotePersona()` when a non-core persona is selected.

`package.json` `files` field only includes `config/personas/abyss*`, `_shared/`, `index.json`, and example config files — non-core persona directories are excluded from the npm tarball.

### Skill Registry (Single Source of Truth)

`bin/lib/skill-registry.js` is the authoritative skill discovery engine for installed skills, `run_skill.js`, Claude command generation, and CI validation.

- Each skill's metadata lives in `skills/**/SKILL.md` YAML frontmatter
- Required fields: `name` (kebab-case slug), `description`, `user-invocable`
- Optional fields: `allowed-tools` (default: `Read`), `argument-hint`, `aliases`
- `category` is auto-inferred from directory prefix (`tools/` → tool, `domains/` → domain, `orchestration/` → orchestration)
- `runtimeType` is auto-inferred: `scripts/` has exactly one `.js` → `scripted`, else `knowledge`
- Registry fail-fast validates: missing fields, bad slugs, illegal tool names, duplicate names, multiple script entries

### Pack Registry

`packs/*/manifest.json` defines installable packs. `abyss` is the core pack; `gstack` is an optional pinned upstream pack installed only when a project lock declares it. `bin/lib/pack-registry.js` is the source of truth for host file mappings and upstream metadata.

Project-level automatic pack sync is driven by `.code-abyss/packs.lock.json`. The installer reads the nearest lock file from the current working directory upward and installs host-specific packs according to `required`, `optional`, `optional_policy`, and `sources`. `node bin/packs.js bootstrap` initializes the lock plus README/CONTRIBUTING snippets, `--apply-docs` writes them back into repo docs, `vendor-pull` / `vendor-sync` manage local sources, `vendor-sync --check` acts as a gate, `report summary` reads `.code-abyss/reports/`, and `uninstall <pack>` removes pack-specific runtime artifacts with a report.

The lock also accepts an optional `tools` field (e.g. `"tools": { "abyss": ">=0.3.0" }`) declaring minimum tool versions; the installer warns at finish when the detected `abyss` binary is missing or older.

### abyss Integration (code graph CLI)

`bin/lib/abyss-integration.js` is the single source of truth for abyss CLI integration: hook injection (claude/gemini `settings.json`; codex TOML logic lives in `bin/adapters/codex.js`), binary detection (PATH → `~/.code-abyss/bin/abyss`), `MIN_ABYSS_VERSION` contract, MCP entries, and lock `tools` checks. Hook injection is idempotent via `HOOK_MARKER` (`indexing-code/hooks/common`): our entries are replaced (re-anchoring stale paths), user entries untouched; uninstall strips marked entries (`stripAbyssHooks` / `stripCodexAbyssIntegration`). Hook commands always point at the **installed** skill tree, never `PKG_ROOT` (ephemeral npx cache). Installer flags: `--with-abyss` downloads the prebuilt binary (`bin/lib/abyss-binary.js`, GitHub Releases, asset names aligned with abyss `release.yml`); `--with-mcp` registers `abyss mcp` (claude → `~/.claude.json`, codex → `[mcp_servers.abyss]`, gemini → `settings.json`). In interactive mode the installer offers the binary download; with `-y` it only detects and hints.

### Style Registry

`bin/lib/style-registry.js` manages `output-styles/index.json`. Exactly one style must be `default`. Each style has `slug`, `label`, `description`, `file`, `targets`, `default`.

### Dual-Target Generation

The installer generates different artifacts per target CLI:

- **Claude**: `~/.claude/commands/*.md` (optional slash commands) — `runtimeType=scripted` calls `run_skill.js`, `knowledge` reads SKILL.md directly
- **Codex**: `~/.codex/skills/**/SKILL.md` — Code Abyss installs core skills directly under the Codex managed skills directory; generated `AGENTS.md` + `instruction.md` provide proactive execution guidance
- **Gemini**: `~/.gemini/GEMINI.md` + `~/.gemini/commands/*.toml` + `~/.gemini/skills/**/SKILL.md` — Gemini reads persistent context from `GEMINI.md`; commands are optional and generated only for invocable skills
- **OpenClaw**: `~/.openclaw/skills/**/SKILL.md` + `<workspace>/AGENTS.md` + `<workspace>/SOUL.md` — OpenClaw reads shared skills from `~/.openclaw/skills/`; workspace bootstrap files carry rules and persona/style

Claude command generation and Codex/Gemini skill installation share the same skill source tree; only `user-invocable: true` skills emit explicit commands, and the current core set defaults to none.

### Adapter Pattern

`bin/install.js` is the orchestration layer. Target-specific logic lives in adapters:
- `bin/adapters/claude.js` — Claude auth detection, settings merge, core files mapping
- `bin/adapters/codex.js` — Codex auth detection, config.toml merge, core files mapping
- `bin/adapters/openclaw.js` — OpenClaw workspace resolution, CLI/config detection, core files mapping
- `bin/lib/ccstatusline.js` — Claude status bar (ccstatusline) integration
- `bin/lib/style-registry.js` — Style catalog + persona registry + runtime guidance assembly
- `bin/lib/persona-fetch.js` — Remote persona fetch + cache
- `bin/lib/utils.js` — Shared: `copyRecursive`, `rmSafe`, `deepMergeNew`, `parseFrontmatter`, `shouldSkip`

### Skill Execution

`skills/run_skill.js` is the script-type skill runner:
1. Resolve skill via registry → validate `runtimeType=scripted`
2. Acquire target lock (async polling, 30s timeout)
3. Spawn child process with the script entry
4. Propagate exit code, release lock on exit/signal

Knowledge-type skills are read-only — no script execution, just load SKILL.md content.

## Key Contracts

### SKILL.md Frontmatter

```yaml
---
name: verify-quality          # kebab-case, unique across all skills
description: Code quality gate
user-invocable: false          # true = explicit command; false = knowledge-only / auto-routed by context
allowed-tools: Bash, Read, Glob  # optional, default: Read
argument-hint: <scan-path>     # optional
aliases: vq                    # optional comma-separated aliases
---
```

### Adding a New Skill

1. Create `skills/<category>/<skill-name>/SKILL.md` with required frontmatter
2. For script-type: add exactly one `scripts/<name>.js` entry point
3. Run `npm run verify:skills` — must pass with zero errors
4. Run `npm test` — especially `test/install-registry.test.js`, `test/install-generation.test.js`, `test/run-skill.test.js`
5. Update invocable skill name lists in test expectations if `user-invocable: true`
6. Verify no name collision with existing skills
7. Update skill count (29 → N) in README, CLAUDE.md, package.json, site/i18n.js, site/index.html

### Style Contract

- Exactly one entry in `output-styles/index.json` must have `default: true`
- `slug` must be kebab-case, unique
- `targets` defaults to all supported install targets if omitted
- Corresponding `.md` file must exist in `output-styles/`

### Persona Contract

- `config/personas/index.json` is the persona enable-list
- Core personas (`core: true` or omitted): must have `<slug>/persona-card.json` locally
- Remote personas (`core: false`): must have inline `label`, `description`, `self`, `user`, `language` snapshot
- `remote.base` URL required if any remote persona exists
- Exactly one persona must be `default`

## Install Targets

| Target | Config file | Skill artifacts | Style mechanism |
|--------|-------------|-----------------|-----------------|
| Claude | `~/.claude/CLAUDE.md` | `~/.claude/commands/*.md` (optional) + `~/.claude/skills/` | `settings.json.outputStyle` = slug |
| Codex | `~/.codex/config.toml` | `~/.codex/skills/` | `~/.codex/instruction.md` (persona + style, via `model_instructions_file`) |
| Gemini | `~/.gemini/settings.json` | `~/.gemini/GEMINI.md` + `~/.gemini/commands/*.toml` (optional) + `~/.gemini/skills/` | Global context + TOML command runtime |
| OpenClaw | `~/.openclaw/openclaw.json` | `~/.openclaw/skills/` + `<workspace>/AGENTS.md` + `<workspace>/SOUL.md` | `SOUL.md` persona/style + workspace AGENTS rules |

Backups go to `<target-dir>/.code-abyss-backup/` with `manifest.json`. Uninstall restores from backup.
