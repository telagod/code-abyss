# DESIGN — Agent OS v5：从配置 tar 到可附着的纪律运行时

> **Status: Active · Primary next-era design (post–v4.10)**  
> **Locks thesis:** one system, not a menu of options.  
> **Supersedes as primary direction:** [`persona-architecture-v3.md`](./persona-architecture-v3.md) (eager→lazy composition remains a *layer*, not the product).  
> **Also absorbs residual truth from:** [`mythos-kernel-merge.md`](./mythos-kernel-merge.md) (kernel as spine), and retires root [`DESIGN.md`](../../DESIGN.md) freeform L1–L4 assembly as *historical*, not current runtime.  
> **Product code today:** v5.0.0-rc.1 (`package.json`). This document is design-only; **today** vs **target** are labeled everywhere they diverge. The v4.10-era "today" narrative below is preserved as historical context; v5.0.0-rc.1 has landed the kill-foyer, runtime control plane (`doctor`/`compose`/`score`), default enforcement, and inject plane.

---

## 0. Thesis (non-negotiable)

**Code Abyss becomes an Agent OS: a local attach/runtime that composes voice, forces judgment, and measures behavior — not a one-shot npm dump of markdown into `~/.claude`.**

Three load-bearing mechanisms, all required:

1. **Compose once, attach many** — always-on guidance is a *product* of a composition graph (persona voice × style × shared core × kernel precedence), not a pile of files hosts happen to read.
2. **Force the spine** — discipline kernel + domain gates are not “hope the model reads the router.” Observable triggers **inject** the right judgment before execution skills run.
3. **Kill half-dead paths** — deprecated flags, dual abyss ownership stories, and “opt-in enforcement that nobody turns on” are deleted or made default; no permanent deprecation foyer.

v3 solved **budget explosion** by lazy-loading judgment. v5 keeps that win and fixes what lazy alone cannot: **invocation is still optional**, so the product still *feels* like a conservative prompt pack.

```
                    ┌─────────────────────────────────────┐
                    │         HOST SESSION                 │
                    │  Claude · Codex · Gemini · OpenClaw  │
                    └──────────────┬──────────────────────┘
                                   │ attach / hooks / context files
                    ┌──────────────▼──────────────────────┐
                    │     code-abyss RUNTIME (target)      │
                    │  doctor · compose · inject · score   │
                    └─┬──────────┬───────────┬────────────┘
          always-on   │          │           │   measurement
          compose     │          │ forced    │
                      │          │ inject    │
         ┌────────────▼──┐  ┌────▼─────┐  ┌─▼──────────┐
         │ voice+style+  │  │ kernel + │  │ battery +  │
         │ shared+anchor │  │ domain   │  │ stop-hooks │
         └───────┬───────┘  │ gates    │  └────────────┘
                 │          └────┬─────┘
                 │               │
         ┌───────▼───────────────▼─────┐
         │  skill registry · packs ·   │
         │  exec skills · run_skill    │
         └──────────────┬──────────────┘
                        │ code-graph boundary
                 ┌──────▼──────┐
                 │ abyss CLI   │  (external; attach owns hooks)
                 └─────────────┘
```

---

## 1. Diagnosis — today (v5.0.0-rc.1 tree facts; v4.10 narrative preserved below)

### 1.1 What ships and works

| Fact | Where | Verdict |
|------|--------|---------|
| Always-on compose is identity → shared → style → kernel **anchor last** | `bin/lib/style-registry.js` `renderRuntimeGuidance` (~316–362) | Correct shape |
| Shared core is six files, not eight freeform behavior engines | `SHARED_FILES_ORDER` `style-registry.js:27–34` | v3 intent landed |
| Persona is schema-bounded voice card, revalidated on render | `bin/lib/persona-voice-card.js`, `loadRenderablePersona` | Judgment cannot hide in freeform identity |
| Kernel vendored in-tree (9 bundles), not submodule | `scripts/sync-mythos.js`, `skills/_kernel/`, `.sync-meta.json` | npm-safe |
| 16 exec skills carry domain-gate pointers | `scripts/wire-domain-gates.js` MAP → `skills/*/SKILL.md` | Compose *prose* exists |
| 4-host install + backup/uninstall + CI smoke from real tarball | `bin/install.js`, adapters, `.github/workflows/ci.yml` | Distribution mature |
| Health gates green at review time | `npm test` 489 pass; `verify:skills` 39 skills | Baseline trustworthy |

### 1.2 Where the architecture is timid (product failure, not test failure)

| Failure mode | Mechanism that breaks | Evidence |
|--------------|----------------------|----------|
| **Lazy = optional** | Kernel invoked only if the model obeys `kernel-router.md` prose | Router is advisory text (`config/personas/_shared/kernel-router.md`); no host-level inject on triggers |
| **Enforcement is default-on** | Stop-hook / banned openers installed by default for claude/codex; opt out with `--no-enforcement` | `bin/install.js` flag surface; default `-y` path installs character hooks |
| **Runtime control plane landed** | `doctor`, `compose`, `score` are shipped bin commands | `bin/install.js` multi-command surface; `bin/lib/runtime-control.js` |
| **Abyss boundary is a deprecation hotel** | Dual stories: code-abyss hooks vs `abyss attach` | `abyss-binary.js` removed in v5.0; `abyss-integration.js` retains strip-only + MCP shape helpers; `abyss attach` is the only production inject path |
| **Docs lie in parallel** | Root `DESIGN.md` still describes freeform L1–L4 persona assembly | `DESIGN.md` lines 7–22 vs actual voice-card + `renderRuntimeGuidance` |
| **Measurement is a side quest** | persona-battery manual / API-cost | `scripts/persona-battery/`, `.github/workflows/persona-battery.yml` workflow_dispatch only |
| **Voice card over-surgery** | Solved judgment accretion by lobotomizing persona residual space | 16-char self/user, banned punctuation, aggregate budget — correct for safety, **insufficient as brand/attitude surface** without a separate stance track |

### 1.3 What v3 got right (must not regress)

- Always-on must stay **small** (budget test `< 8000` with large headroom; measured ~4620 max combo in 4.10 era).
- Kernel content stays **lazy** in the prompt sense — do not bake 9 bundles into every render.
- Persona voice cards stay **judgment-free** (no freeform decision tables in voice fields).
- Forbidden zone: **correctness / security decisions / verify done-gate / data-loss protection never lose to voice or style.**

v5 is not “eager bake the kernel again.” v5 is **eager *control plane*, lazy *content*.**

---

## 2. Target architecture

### 2.1 Product surface (target)

| Surface | Role | Today | Target |
|---------|------|-------|--------|
| `code-abyss` CLI | Install + **runtime control plane** | install/uninstall only | `install`, `uninstall`, **`doctor`**, **`compose`**, **`attach`**, **`score`** (names illustrative — not frozen APIs) |
| Always-on blob | Host context files | Written once at install from `renderRuntimeGuidance` | Same function is the **single compose engine**; re-compose on persona/style change without full reinstall |
| Inject plane | Force judgment into session | Prose router only | Trigger table → inject kernel/domain skill paths into host-visible channel (hooks, session-start, or generated “must-read” stubs — host-specific, contract shared) |
| Score plane | Measure behavior | Opt-in battery | `score` runs mechanical probes always; LLM judge optional when keys present |
| abyss | Code graph | Parallel CLI + deprecated code-abyss flags | **Only** `abyss` owns binary + graph hooks; code-abyss **detects + documents + refuses to re-own** |

### 2.2 Always-on composition (today truth + target deltas)

**Today (keep):**

```
renderRuntimeGuidance =
  renderPersonaIdentity(voice card)
  + loadSharedBehavior(SHARED_FILES_ORDER)
  + applyPersonaVars(style.md)
  + kernel precedence anchor   // LAST — position bias
```

**Target deltas (without re-bloat):**

| Piece | Rule |
|-------|------|
| Identity | Still fixed template from voice card — **no freeform identity.md return** |
| Shared | Iron laws + thin router + environment remain always-on; injection-awareness stays compact |
| Router | Becomes **dispatch table that mirrors inject plane triggers** (same source of truth as runtime inject config — one table, two consumers: prose for hosts without hooks, inject for hosts with hooks) |
| Style | Format skeleton only; may stay spicy (cultivator skeleton is brand, not judgment) |
| Anchor | Remains last; wording may sharpen but precedence unchanged |
| Budget | Keep CI ceiling; prefer **always-on core < 5000** as soft target, hard fail still `< 8000` until hosts prove larger budgets |

### 2.3 Dual track: voice vs stance (target)

| Track | What it is | What it must not be | Storage (target) |
|-------|------------|---------------------|------------------|
| **Voice** | self/user/language/register/emoji/flourish | Decision tables, auth tiers, “skip verify” | Existing `persona-voice-card` (shipped) |
| **Stance** | Optional, versioned, **auditable** attitude modules (e.g. candor defaults, initiative budget) that only fire in residual space character already owns | Security authorization, data-loss exceptions | New optional file or pack — **schema-capped**, validated like voice; default = none |

Stance is how the product gets “炸” without undoing voice-card discipline: **explicit modules with tests**, not smuggling judgment back into freeform markdown.

If stance is absent → behavior = kernel + iron laws only (degradation-safe).

### 2.4 Forced inject plane (the load-bearing novelty)

**Problem:** domain gates in SKILL.md are one-line blockquotes. Models skip them under pressure.

**Target contract:**

```
Trigger (observable)     →  Must load (judgment)        →  Then may run (execution)
─────────────────────       ─────────────────────────      ────────────────────────
path matches security/*  →  skills/_kernel/security     →  securing-*/defending-*
user text: threat model  →  security SKILL.md           →  architecting-security
Edit on *.tsx UI         →  frontend                    →  applying-ui-design-system
“is this done?”          →  doctrine (done-gate)        →  —
stack/API design ask     →  backend                     →  designing-architectures
hardware/KiCad           →  hardware                    →  operating-kicad-eda / designing-hardware-products
agent/RAG/eval           →  ml                          →  building-agent-systems
```

**Implementation freedom (not frozen):** host Stop/PreTool hooks, generated command wrappers, session-start manifest, or a small local MCP tool `code-abyss_inject` — **as long as**:

1. Triggers are **statelessly checkable** (path, tool name, keyword class — not “when things get messy”).
2. Inject records an **audit line** (what fired, which bundle).
3. Tests assert trigger → bundle mapping without requiring a live LLM.

**Domain gate prose in SKILL.md stays** as degradation path when inject plane is missing (OpenClaw / degraded hosts).

### 2.5 Kernel vendoring (unchanged spine, clearer consumer)

| Today | Target |
|-------|--------|
| `sync-mythos.js` wipe-and-rebuild `skills/_kernel/` | Keep; never hand-edit kernel content |
| `user-invocable: false` forced on kernel | Keep |
| `scripts/kernel-hooks/*` overlay | Keep; **default install path for enforcement** (not opt-in theater) |
| `.sync-meta.json` provenance | Keep; `doctor` surfaces commit |

### 2.6 Skills, packs, runner

| Subsystem | Today | Target |
|-----------|-------|--------|
| Skill registry | `bin/lib/skill-registry.js` single SoT | Keep; inject plane **reads registry names**, does not fork discovery |
| Exec skills | 30 domain + scripted tools | Keep; gates remain + inject reinforces |
| `run_skill.js` | Lock + spawn scripted skills | Keep; optional pre-flight “domain inject required?” check for scripted security tools |
| Packs | `packs/abyss`, optional `gstack`, lock file | Keep core pack; **gstack stays optional/non-default**; no new mandatory packs for v5 |
| Remote personas | Fetch + validate + cache | Keep validation-before-cache; **target:** HTTPS-only + host allowlist (security hardening, small) |

### 2.7 Abyss / code-graph boundary (clean cut)

| Concern | Owner **today** (messy) | Owner **target** |
|---------|-------------------------|------------------|
| Binary install | `abyss-binary.js` (deprecated) + external install.sh | **abyss only** |
| Graph hooks (edit/session) | `abyss-integration` inject* + `abyss attach` | **`abyss attach` only** |
| MCP schema for abyss tools | `--with-mcp` in code-abyss | Host config or abyss docs; code-abyss may **detect** and **doctor-warn** |
| Skill calling convention | `skills/indexing-code` | Stay in code-abyss (convention skill) |
| Version floor | `MIN_ABYSS_VERSION` in `abyss-integration.js` | Keep detect + warn in `doctor` |

### 2.8 Enforcement + measurement

| Control | Today | Target |
|---------|-------|--------|
| Character Stop-hook (banned openers) | `--with-enforcement` opt-in | **Default on** for hosts that support Stop; skip only with explicit `--no-enforcement` |
| persona-battery | Manual + optional GHA | `code-abyss score` mechanical subset in CI always; full LLM judge remains manual/dispatch |
| Kernel precedence | Anchor string in compose | Anchor + inject plane + hooks — three layers, same rule |

### 2.9 CI / release linkage

| Gate | Today | Target |
|------|-------|--------|
| `npm test` + `verify:skills` | PR + release | Keep |
| packs check | PR only | **Add to release.yml** (defense in depth) |
| Smoke 4×3 OS | PR | Keep; extend smoke assert enforcement files present when default-on lands |
| Battery | workflow_dispatch | Mechanical probes on PR when free; LLM judge stays optional |
| Publish | tag = version, `--provenance` | Keep |

---

## 3. Linkage matrix (one system)

Rows = source of truth / producer. Columns = consumer.  
**E** = edge exists (must). **—** = must not couple. **T** = target edge (not fully shipped).

| ↓ produces \ consumes → | Compose engine | Inject plane | Host adapters | Skill registry | Packs | Kernel tree | Voice cards | Enforcement | Battery/score | abyss CLI | CI/release |
|-------------------------|:--------------:|:------------:|:-------------:|:--------------:|:-----:|:-----------:|:-----------:|:-----------:|:-------------:|:---------:|:----------:|
| **Voice cards** (`config/personas/*.json`) | E | — | E (via compose) | — | — | — | — | — | E (probes) | — | E (verify) |
| **Styles** (`output-styles/`) | E | — | E | — | — | — | — | — | E | — | E |
| **Shared core** (`_shared/`) | E | E (router table **T**) | E | — | — | — | — | — | — | — | E |
| **Compose engine** (`style-registry.renderRuntimeGuidance`) | — | — | E | — | — | — | E (reads) | — | — | — | E (budget tests) |
| **Kernel** (`skills/_kernel/`) | E (anchor only) | E | E (installed skills) | E (discovered) | — | — | — | E (character hooks) | E | — | E |
| **Domain gates** (exec SKILL.md) | — | E (mirror) | E | E | — | E (points to) | — | — | — | — | — |
| **Skill registry** | — | E | E (commands/install) | — | E | E | — | — | — | — | E (`verify:skills`) |
| **Pack lock** | — | — | E (install select) | — | — | — | — | — | — | E (tools floor **T**/today warn) | E |
| **Installer** (`install.js` + lifecycle) | E (writes compose) | T (writes inject) | E | E | E | E (copy tree) | E | T→E default | — | detect | E (smoke) |
| **Adapters** (claude/codex/gemini/openclaw) | E | T | — | E | E | E | E | T | — | detect | E (smoke) |
| **Enforcement hooks** | — | — | E | — | — | E (character) | — | — | E (overlap probes) | — | E |
| **Battery/score** | reads outputs | — | — | — | — | E | E | E | — | — | T mechanical |
| **abyss CLI** | — | — | attach only | — | tools field | — | — | — | — | — | optional smoke |
| **CI/release** | — | — | — | — | — | — | — | — | E | — | — |

### 3.1 Hard “must not” edges (anti-coupling)

1. **Voice cards must not** reference kernel authorization tiers or skip-verify instructions.  
2. **Compose engine must not** inline full kernel bundle bodies.  
3. **code-abyss must not** re-own abyss binary download or graph hook injection after the kill list lands.  
4. **Packs must not** become a second skill registry (manifest maps into registry + install, does not fork discovery rules).  
5. **Styles must not** override iron-laws / kernel precedence (anchor last + tests).  
6. **Battery must not** invent pass scores without a judge (UNSCORED stays honest — already true in battery runner design).

### 3.2 Failure / degradation map

| Missing piece | Behavior |
|---------------|----------|
| No inject plane (old install) | Prose router + domain gate blockquotes only (v4.10 behavior) |
| No enforcement hooks | Compose + iron laws still present; higher risk of capitulation openers |
| No abyss binary | indexing-code skill is docs-only; `doctor` warns; install still succeeds |
| Invalid voice card | Neutral fallback + stderr (today); target: visible marker in identity line |
| Kernel sync not run | Last vendored tree ships; content may lag mythos — `.sync-meta` shows age in `doctor` |
| Pack lock absent | Install core abyss pack only |

---

## 4. Per-subsystem contracts (must / must not)

### 4.1 Installer & adapters

- **Must** remain the way artifacts land on disk for offline hosts.
- **Must** call the **same** compose engine the runtime uses (no second template path).
- **Must** preserve backup/uninstall manifest semantics.
- **Must not** grow new long-lived “compatibility” flags without a kill date already written in this design’s kill list.
- **Target must** expose re-compose / re-attach without requiring full skill recopy when only persona/style changes.

### 4.2 Always-on composition

- **Must** keep order: identity → shared → style → kernel anchor.
- **Must** revalidate voice cards on every render.
- **Must not** reintroduce freeform `identity.md` / `examples.md` / `posthistory.md` as render sources.
- **Target must** generate router prose from the **same trigger table** as inject.

### 4.3 Kernel + domain gates

- **Must** stay vendored via wipe-sync; provenance file required.
- **Must** remain non-invocable as user slash noise.
- **Must** win conflicts with voice/style.
- **Target must** have inject coverage for the 16 gated exec skills at minimum (MAP in `wire-domain-gates.js`).

### 4.4 Skill & pack registries

- **Must** fail-fast on contract violations (`verify:skills`).
- **Must** keep `user-invocable` as the only command-generation switch.
- **Must not** treat gstack as default-required (lock already excludes it; keep that).

### 4.5 Abyss boundary

- **Must** document single install path for the binary (abyss’s).
- **Must** keep `MIN_ABYSS_VERSION` / skill-manifest discovery where useful.
- **Must not** ship unsigned binary download in code-abyss after kill phase.

### 4.6 Enforcement + measurement

- **Must** keep banned-opener policy aligned with character kernel.
- **Must** keep battery probes honest (no fake green).
- **Target must** default-on enforcement where host events exist (claude/codex per current hook scripts).

### 4.7 CI/release

- **Must** keep multi-node test + multi-OS smoke + provenance publish.
- **Target must** fail release if packs lock invalid (parity with PR CI).

---

## 5. Kill list (conservative / half-dead → dead)

Each item: **kill condition**, **replacement**, **risk if delayed**.

| ID | Kill | Replacement | Risk if delayed |
|----|------|-------------|-----------------|
| K1 | `--with-abyss` + `bin/lib/abyss-binary.js` | abyss `install.sh` / cargo / `@code-abyss/cli` | Unverified binary path remains |
| K2 | `--with-mcp` as code-abyss responsibility | Host-native MCP config docs | Dual ownership |
| K3 | `injectClaudeHooks` / `injectGeminiHooks` production path for graph | `abyss attach` only | Deprecation hotel forever |
| K4 | Opt-in-only `--with-enforcement` as the *recommended* story | Default-on + `--no-enforcement` | Product stays “polite pack” |
| K5 | Root `DESIGN.md` freeform L1–L4 as if current | Pointer to this doc + voice-card truth | Contributor builds dead architecture |
| K6 | Parallel “primary design” status on v3 draft | v3 marked **Superseded as product thesis** (layer design still cited) | Two futures |
| K7 | README hard-coded stale test counts as truth | Generate from jest or omit numbers | Trust erosion |
| K8 | CLAUDE.md claim “invocable defaults to none” | Reflect five true invocables or “see registry” | Wrong contributor mental model |
| K9 | Silent HTTP / open redirect in persona fetch | HTTPS + allowlist | Supply-chain nibble on remote personas |
| K10 | Shipping posture that treats battery as non-product | Mechanical `score` in developer loop | No behavior regression net |

**Not killed:** packs system, remote personas, multi-host adapters, mythos sync, voice-card schema, cultivator style flavor, indexing-code convention skill.

---

## 6. Migration phases (landable cuts from v4.10)

Each phase: **one PR-able unit**, green gates, independent value. No big-bang freeze.

### Phase V5-0 — Design truth (this document)

- Land this design; supersession pointers; no product code.
- **Done when:** single primary next-era doc; v3/mythos/DESIGN linked.

### Phase V5-1 — Kill foyer (delete deprecations) ✅ landed on `feat/agent-os-v5-1-kill-foyer`

- Remove K1–K3 code paths and flags; keep detect messaging.
- Uninstall still strips legacy hook markers if present.
- **Done when:** no `abyss-binary` download path; help text points only to abyss; tests updated; CI green.

### Phase V5-2 — Docs & contract honesty ✅

- K5, K7, K8; expand `docs-drift` tests to skill counts / invocable set / forbid DESIGN freeform-as-current.
- **Done when:** drift tests fail if CLAUDE/README lie again.

### Phase V5-3 — Default enforcement ✅

- K4: install character hooks by default on capable hosts; `--no-enforcement` escape.
- Smoke asserts hook presence.
- **Done when:** `-y` install on claude includes enforcement artifacts.

### Phase V5-4 — Inject plane v1 ✅

- Single trigger table module (`bin/lib/inject-plane.js`) (data) → (a) renders router markdown (b) drives hook/session inject for ≥ security + doctrine done-gate + the 16 domain MAP entries.
- Unit tests: trigger fixtures → expected bundle id.
- **Done when:** tests prove mapping; at least one host path installs inject artifacts.

### Phase V5-5 — Runtime CLI surface ✅

- `doctor` (versions, kernel sync age, abyss detect, enforcement on/off, compose budget).
- `compose --persona --style` rewrite host context without full skill recopy.
- **Done when:** documented commands; tests on compose output identity.

### Phase V5-6 — Score plane ✅

- Mechanical battery subset in `npm test` or `npm run score:mechanical` on PR.
- LLM judge remains opt-in.
- **Done when:** banned-opener class probes gate CI without API keys.

### Phase V5-7 — Stance modules (optional brand power) ✅

- Schema + validator + residual-only render slot; zero stance = today’s behavior.
- **Done when:** invalid stance fails verify; cannot express auth tiers.

### Phase V5-8 — Hardening ✅

- K9 persona-fetch HTTPS/allowlist; release.yml packs checks; visible neutral-fallback marker.
- **Done when:** fetch tests cover redirect rejection.

**Ordering constraint:** V5-1 before advertising “clean abyss boundary”; V5-4 before claiming “forced spine”; V5-3 can parallel V5-2.

---

## 7. Non-goals

- Rewriting mythos kernel prose quality or every exec skill body.
- Merging the abyss Rust repo into this git tree (boundary is protocol/CLI, not monorepo mandate).
- Making persona freeform Character-Card v2 the render path again.
- Baking full kernel bundles into always-on context.
- Guaranteeing identical inject fidelity on every host on day one (degrade to prose; measure per-host).
- Freezing CLI flag strings or JS class names in this document.
- Marketing-site redesign / version publish as part of design landing.
- Turning persona-battery LLM judge into a required PR gate without cost controls.

---

## 8. Supersession & document graph

| Document | Role after this design |
|----------|------------------------|
| **`docs/design/agent-os-v5.md` (this file)** | **Primary product architecture for post–v4.10** |
| `docs/design/persona-architecture-v3.md` | **Layer design** for eager→lazy compose; **superseded as product thesis** by this file; still valid for “why always-on is small” |
| `docs/design/mythos-kernel-merge.md` | Historical merge rationale; already superseded by v3; now two hops under Agent OS |
| `docs/design/impl-specs-p2-p5.md` | Draft impl scraps for kernel-merge era — **not** authority; do not implement blindly |
| `docs/persona-architecture-v2.md` | Historical freeform layers — archive |
| Root `DESIGN.md` | Must point here for current truth; body retains historical decisions until edited in V5-2 |

---

## 9. Open decisions (residual only — thesis not blocked)

| # | Question | Default if undecided | Blocks thesis? |
|---|----------|----------------------|----------------|
| O1 | Inject transport per host (hook vs MCP vs file drop) | Prefer existing host hook events; file drop fallback | No — contract is trigger→bundle |
| O2 | Stance module authoring UX | Ship schema + forge skill later | No — voice-only remains valid |
| O3 | Whether `doctor`/`compose` live under same `bin/install.js` multi-command or split bin entries | Single bin multi-command (npm bin name `code-abyss`) | No |
| O4 | Exact always-on soft budget (5k vs keep 8k hard only) | Hard 8k until V5-5 measures host headroom | No |

---

## 10. Success criteria (how we know v5 landed)

1. A user can change persona/style and **re-compose** without re-copying the entire skill tree.  
2. A security-shaped task on a hook-capable host produces an **audit-visible kernel inject** (test or log), not only a hope.  
3. Default install enables **enforcement** on claude/codex; polite disable is explicit.  
4. No code-abyss path downloads the abyss binary.  
5. One design doc (this) is the cited product architecture; DESIGN.md does not contradict it.  
6. Mechanical behavior probes fail CI if banned openers regress.  
7. Forbidden zone still holds: voice/stance never outrank kernel on correctness/security/done-gate/data-loss.

---

## 11. One-page operator summary

**Today:** beautiful contracts, timid control plane.  
**Tomorrow:** same contracts, **brutal control plane** — compose, inject, score, kill the foyer.  
**Soul:** 邪修 remains flavor in style; **judgment stays kernel**; **Grok-grade product energy** is runtime force and honest measurement, not larger persona novels.

---

*End of design. Implementation starts at Phase V5-1 only after this document is the agreed primary.*
