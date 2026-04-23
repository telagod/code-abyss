# Code Abyss Project Diagnosis

> Model: glm-5.1 | Date: 2026-04-22

## 1. Overall Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| Architecture Design | 8.5/10 | Clean 5-layer separation, mature adapter pattern |
| Code Implementation Quality | 6.5/10 | Monolith, code duplication, hardcoded paths |
| Test Coverage | 7.5/10 | Excellent E2E smoke tests, but skips and blind spots |
| Skill System Maturity | 4/10 | **Biggest weakness** — only 21 skills, missing key categories |
| Documentation Consistency | 7/10 | docs-drift guard is good, but drift items remain |
| Extensibility | 5/10 | Structure supports extension, but skill ecosystem severely incomplete |

---

## 2. Architecture Strengths

1. **Five-layer separation** (Persona → Style → Skill → Installer → Pack) with clear responsibilities
2. **Adapter isolation** — Claude/Codex/Gemini differences encapsulated in `bin/adapters/*.js`
3. **Registry constraint validation** — slug format, unique defaults, unique names, defensive enforcement
4. **Pack system** — lock/manifest/vendor/report pipeline is complete and well-tested
5. **Docs drift prevention** — `docs-drift.test.js` automatically blocks stale claims

---

## 3. Critical Defects (Priority Order)

### 🔴 P0 — Skill System Structural Gaps

**This is the project's biggest problem.** The project source (`skills/`) has only **21 SKILL.md files**, missing three critical skill categories:

| Missing Category | Installed Version Has | Impact on Skill System |
|-----------------|----------------------|------------------------|
| **workflows/** (7 items) | bugfix, investigate, review, ship, architecture-decision, skill-evolution, multi-agent | No workflows = no executable process orchestration |
| **guards/** (2 items) | pre-commit-gate, pre-merge-gate | No guards = no safety gatekeeping |
| **routers/sage/** (1 item) | Full router with schema-v2, route-policy, skill-catalog references | Current root-level SKILL.md is rudimentary |
| **tools/verify-skill-system** | Validation tool with scripts/run.js | No self-verification capability |

**Project Source vs Installed Version comparison:**

| Aspect | Project Source (`code-abyss/skills/`) | Installed Version (`~/.claude/skills/`) |
|--------|---------------------------------------|---------------------------------------|
| Schema version | Inconsistent, mixed styles | Unified schema-version: 2 |
| Language | Chinese | English (more universal) |
| Router | Flat file at root level | `routers/sage/` with reference documents |
| Workflows | **MISSING** | 7 complete workflows |
| Guards | **MISSING** | 2 guards |
| Domain references | Flat `.md` files | Structured `references/expert-*.md` |
| Route map | None | 29-32 routes with priority, conflicts, aliases |
| Tool executors | `agents/openai.yaml` + `scripts/*.js` | `scripts/run.js` per tool |

**Conclusion: The installed personal skill system is the "real" system; the project source is merely an incomplete subset.**

### 🔴 P0 — install.js is a 1064-line Monolith

- `installCore()` is a single 230-line function with 3 duplicated target branches
- Pack installation logic copy-pasted 3 times (Claude/Codex/Gemini nearly identical)
- Command generation logic scattered across `install.js`, `gstack-claude.js`, `gstack-gemini.js`

### 🟡 P1 — Gemini Missing from Abyss Manifest

`packs/abyss/manifest.json` has no `gemini` key. `gemini.js` hardcodes core files instead of using `getPackHostFiles`. Violates single-source-of-truth principle.

### 🟡 P1 — Outdated package.json Description

`"4种可切换输出风格与 56 篇攻防工程秘典"` — actually only 21 skills, 56 is stale.

### 🟡 P1 — Registry/Route-map Path Mismatches

- Sage router: physical path `skills/SKILL.md`, registry expects `skills/routers/sage/SKILL.md`
- Design variants: physical path `skills/domains/frontend-design/claymorphism/SKILL.md`, registry expects `skills/domains/frontend-design/variants/claymorphism/SKILL.md`
- Multi-agent: physical path `skills/orchestration/multi-agent/SKILL.md`, registry expects `skills/workflows/multi-agent/SKILL.md`

### 🟡 P1 — Code Anti-patterns

- `rmSafe` uses `Atomics.wait(SharedArrayBuffer)` for sleep — non-portable
- `gstack-codex.js` name implies Codex-specific but is actually a shared module
- `style-registry.js` module-level caches (`_cache`, `_personaCache`) could cause test pollution
- `process.exit()` scattered in library functions, making unit testing difficult
- `bin/uninstall.js` duplicates but diverges from `runUninstall` in `install.js`

---

## 4. Specific Recommendations for Building the Strongest SKILL System

### 4.1 Unify Skill Schema to v2

Current project source SKILL.md format is inconsistent. The installed version uses complete schema-version 2, including:

```yaml
schema-version: 2
name: ...
title: ...
description: ...
kind: router|domain|workflow|tool|guard
visibility: public
user-invocable: true|false
trigger-mode: [auto|manual]
trigger-keywords: [...]
negative-keywords: [...]
priority: <number>
runtime: knowledge|scripted
executor: none|node
permissions: [Read, Write, Grep, Bash]
risk-level: low|medium|high
supported-hosts: [codex, claude, gemini]
status: stable
owner: self
last-reviewed: <date>
review-cycle-days: <number>
tags: [...]
aliases: [...]
auto-chain: [...]
depends-on: [...]
conflicts-with: [...]
```

**Action:** Upgrade all 21 source SKILL.md files to schema-v2 format. This is the foundation — without a standard format, routing and guards cannot be built.

### 4.2 Fill In Missing Skill Directory Structure

Backfill the complete structure from the installed version into the project source:

```
skills/
├── routers/sage/SKILL.md              # Upgrade to full router
│   └── references/
│       ├── route-policy.md
│       └── skill-catalog.md
├── domains/                            # Keep 10, but reorganize references
│   ├── ai/references/expert-*.md
│   ├── architecture/references/expert-*.md
│   ├── ... (same pattern)
│   └── frontend-design/variants/       # ⚠️ Note: unify path
│       ├── claymorphism/SKILL.md + references/tokens.css
│       ├── glassmorphism/SKILL.md + references/tokens.css
│       ├── liquid-glass/SKILL.md + references/tokens.css
│       └── neubrutalism/SKILL.md + references/tokens.css
├── workflows/                           # 🆕 New
│   ├── bugfix/SKILL.md + references/
│   ├── investigate/SKILL.md + references/
│   ├── review/SKILL.md + references/
│   ├── ship/SKILL.md + references/
│   ├── architecture-decision/SKILL.md + references/
│   └── skill-evolution/SKILL.md + references/
├── guards/                              # 🆕 New
│   ├── pre-commit-gate/SKILL.md + references/ + scripts/run.js
│   └── pre-merge-gate/SKILL.md + references/ + scripts/run.js
├── tools/
│   ├── gen-docs/
│   ├── verify-change/
│   ├── verify-module/
│   ├── verify-quality/
│   ├── verify-security/
│   └── verify-skill-system/             # 🆕 New
│       └── scripts/run.js
└── orchestration/                        # 🔄 Consider migrating to workflows/
    └── multi-agent/SKILL.md
```

### 4.3 Build a Generation Pipeline

**Core issue:** Are the registry and route-map in `personal-skill-system/` hand-maintained or auto-generated?

**Recommendation: Build an automation pipeline:**

```
SKILL.md (schema-v2)
  → bin/generate-registry.js  → registry.generated.json
  → bin/generate-route-map.js → route-map.generated.json
  → bin/generate-adapters.js  → adapters/{claude,codex,gemini}/profile.json
```

This way:
- Registry is **automatically extracted** from SKILL.md frontmatter
- Route-map is **automatically derived** from trigger-keywords/conflicts-with/aliases
- Installer only reads generated registry, no hardcoding

### 4.4 Upgrade Routing System

Current sage router is a flat Chinese routing table. After upgrade:

1. **Three-tier routing strategy:**
   - **Exact match** (trigger → skill): high priority
   - **Namespace match** (domain prefix → domain skill): medium priority
   - **Keyword fuzzy match** (intent → candidate list): low priority, requires clarification

2. **Conflict resolution:** Use `conflicts-with` declarations instead of hardcoded priority numbers
   - `bugfix` conflicts-with `review`, `investigate`
   - `architecture-decision` conflicts-with `frontend-design`
   - `security` vs `architecture` → security intent wins

3. **Auto-chaining:** Implement automatic trigger sequences based on `auto-chain` field
   - New module → gen-docs → verify-module → verify-security
   - Bug fix → bugfix → verify-quality → verify-security
   - Release → ship → verify-change → pre-merge-gate

### 4.5 Split the install.js Monolith

```
bin/
├── install.js              # Slim CLI entry + orchestration dispatch
├── lib/
│   ├── installer-core.js   # Extracted from installCore()
│   ├── command-generator.js # Shared command generation (eliminates 3x duplication)
│   ├── pack-installer.js   # Unified pack installation (eliminates 3x duplication)
│   └── ...
├── adapters/
│   ├── claude.js           # Only Claude-specific logic
│   ├── codex.js            # Only Codex-specific logic + TOML
│   └── gemini.js           # Only Gemini-specific logic
```

### 4.6 Build Self-verification Closed Loop

The project source lacks `verify-skill-system` tool. This is **critical** — you should be able to verify your own skill system's completeness.

**Specific actions:**

1. Port `verify-skill-system`'s `scripts/run.js` to project source `skills/tools/verify-skill-system/`
2. Add `npm run verify:skill-system` alongside `npm run verify:skills`, validating:
   - Every SKILL.md frontmatter completeness
   - Registry/route-map consistency with on-disk SKILL.md files
   - All references/ file paths exist
   - All scripts/run.js are executable
   - Route-map covers all user-invocable skills

### 4.7 Enhance Domain Expert References

Current domain skill references are flat `.md` files (e.g., `security/pentest.md`). Upgrade to structured `references/expert-*.md` pattern, where each expert module should contain:

```markdown
# Expert Module: <topic>

## When to activate
- <trigger conditions>

## Core principles
- <principle 1>
- <principle 2>

## Decision framework
- <structured decision tree>

## Anti-patterns to avoid
- <common mistakes>

## References
- <links to deeper resources>
```

### 4.8 Fill High-value Skill Gaps

Based on the comparison between installed version and project registry, these skills are **planned but not implemented**:

| Skill | Type | Value | Recommendation |
|-------|------|-------|----------------|
| `chart-visualization` | domain | G2/S2 data visualization | Port from personal-skill-system |
| `verify-chart-spec` | tool | Chart spec validation | Port from personal-skill-system |
| `verify-s2-config` | tool | S2 config validation | Port from personal-skill-system |

**Future candidates:**

| Skill | Type | Rationale |
|-------|------|-----------|
| `performance` | domain | Performance optimization is high-frequency need |
| `database` | domain | Database design/optimization (devops covers it shallowly) |
| `accessibility` | domain | a11y is too shallow under frontend-design |
| `incident-response` | workflow | Security incident response process |
| `migrate` | workflow | Migration/upgrade workflow |

---

## 5. Priority Action List

| Priority | Action | Impact |
|----------|--------|--------|
| **P0-1** | Backfill workflows/, guards/, routers/ from installed version to project source | 21 → 32 skills, fills critical categories |
| **P0-2** | Unify all SKILL.md to schema-version 2 format | Foundation for routing & registry automation |
| **P0-3** | Fix path mismatches (routers/sage, variants/, workflows/) | Install pipeline can work correctly |
| **P1-1** | Build generation pipeline (registry + route-map auto-extracted from frontmatter) | Eliminates manual maintenance drift risk |
| **P1-2** | Split install.js monolith | Dramatically improved maintainability & testability |
| **P1-3** | Add Gemini to abyss manifest | Three-platform alignment |
| **P2-1** | Port chart-visualization and 3 other planned skills | Coverage from 71% → 100% |
| **P2-2** | Port verify-skill-system self-verification tool | Build self-verification closed loop |
| **P2-3** | Clean up .code-abyss/reports/ and stale package.json description | Documentation consistency |

---

## 6. Additional Code Quality Issues

### Test Gaps

| Issue | Details |
|-------|---------|
| `install.test.js` is skipped | `describe.skip` — should be removed or tests split properly |
| No unit tests for `pack-docs.js` | Marker-based snippet injection has no dedicated coverage |
| No unit tests for `ccstatusline.js` | `detectCcstatusline` calls `npx` synchronously with 30s timeout |
| Limited gstack adapter unit tests | Path rewrites, frontmatter parsing need more granular coverage |
| No edge case tests for `packs.js` CLI | Missing coverage for unknown args, missing required subjects, `--json` |
| No tests for vendor provider registry | `vendor-providers/index.js` has no unit test file |

### Data Integrity

| Issue | Details |
|-------|---------|
| `personas/index.json` has `gender` field | Couples data to presentation concerns |
| `.code-abyss/reports/` has 60 stale JSON files | Should be in `.gitignore` |
| Hand-rolled TOML parser in `codex.js` | Functional but incomplete for full TOML spec |
| Mixed import patterns | `path.join(__dirname, '...', 'module.js')` vs `require('./module')` |

---

**Bottom Line:** The project architecture is solid, the install pipeline is mature, but the Skill system is the biggest weakness. The current 21 skills in the project source are merely a subset of the 32 installed skills, missing three critical categories: workflows, guards, and a complete router. **Prioritizing backfilling the complete skill tree into the project source and unifying to schema-v2 is the highest-leverage action.**