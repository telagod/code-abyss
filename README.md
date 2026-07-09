<!-- Code Abyss · README -->

<p align="center">
  <a href="https://telagod.github.io/code-abyss/">
    <img src="https://raw.githubusercontent.com/telagod/code-abyss/main/assets/banner.svg" alt="Code Abyss — Personality, depth, and a security spine" width="100%">
  </a>
</p>

<h3 align="center">Composable persona · style · 30 engineering skills · 4 native security domains · self-evolution forge<br/>for Claude Code · Codex CLI · Gemini CLI · OpenClaw</h3>

<p align="center"><sub>Need code graph intelligence? Use the companion <a href="https://github.com/telagod/abyss"><code>abyss</code></a> Rust CLI — it auto-attaches its hooks to claude/codex/gemini. The <code>indexing-code</code> skill ships its calling convention; the CLI ships separately.</sub></p>

<p align="center">
  <a href="https://www.npmjs.com/package/code-abyss"><img src="https://img.shields.io/npm/v/code-abyss?color=9b8cff&label=npm&style=flat-square" alt="npm"></a>
  <a href="https://github.com/telagod/code-abyss/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/telagod/code-abyss/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-c4b8ff?style=flat-square" alt="MIT"></a>
  <a href="https://telagod.github.io/code-abyss/"><img src="https://img.shields.io/badge/site-pages-9b8cff?style=flat-square" alt="Site"></a>
</p>

<p align="center">
  <a href="https://telagod.github.io/code-abyss/"><b>Website</b></a> ·
  <a href="docs/specs/persona-voice-card-v1.0.md"><b>Spec</b></a> ·
  <a href="docs/README.zh-CN.md"><b>中文文档</b></a> ·
  <a href="CHANGELOG.md"><b>Changelog</b></a> ·
  <a href="https://telagod.github.io/code-abyss/submit.html"><b>Submit Persona</b></a>
</p>

---

## The problem

Most AI coding agents have **no memory of who they are**. They respond in the same flat tone whether they're debugging a race condition, reviewing architecture, or triaging a P0 incident. They forget your conventions between sessions. They flip-flop on advice. They sound like a help-desk script.

And when you ask them about **security** — pentest, code audit, threat modeling, IR — most agents fall back to generic OWASP recitation, because the underlying skill library was never written by people who actually run red/blue/purple teams.

You don't want a help desk. You want a **principal engineer who shows up with a personality, executes consistently, closes the loop — and has a security spine when things get real**.

## What Code Abyss does

One command installs a layered runtime into your agent:

```
┌───────────────────────────────────────────────────────────┐
│  Voice      who it sounds like  →  config/personas/*.json │
│  Judgment    how it decides      →  skills/_kernel/*      │ ← lazy, router-invoked
│  Style       how it sounds       →  output-styles/*.md    │
└───────────────────────────────────────────────────────────┘

  6 personas  ×  6 styles  =  36 validated combinations
```

Pick any persona. Pair it with any style. Underneath both sits a **discipline kernel** — 9
bundles of engineering judgment (when to push back, how to size scope, when a domain calls
for a specific tradeoff) invoked by a thin router on demand instead of baked into every
prompt. The always-on core stays small (iron laws, skill routing, a precedence anchor,
the safety floor); everything else loads lazily so adding discipline content doesn't blow
the context budget. Your agent becomes a **consistent character with structured execution,
domain expertise, and a backstop against the trained agree-reflex** — across every session.

### What's new in v4

- **4 native security domains** — 4073 lines of original defense engineering (no Apache-2.0 upstream)
- **30 skills total**, all `SKILL.md` ≤ 110 lines (avg 59), heavy content lives in `references/`
- 5 verify skills rewritten as **judgment-type knowledge** (when to use, how to interpret output, exemption rules)
- Office skills slim to under 100 lines each; 4 design systems consolidated into one selector skill
- **v4.1 — self-evolution forge**: `cultivating-skills` / `cultivating-personas` let the agent distill repeated workflows into reusable skills, with a safety scan and a three-tier publish funnel (local → project → community)
- **v4.4 — hardware + academic writing**: 3 new domain skills (KiCad EDA, hardware product pipeline, AIGC detection reduction) + prompt injection defense + execution-drive shared behavior
- **v4.5 — dynamic persona loading**: only the `abyss` persona slug (邪修红尘仙) ships with npm — all other personas are fetched from GitHub on first use and cached locally, slimming the package
- **v4.6 — `indexing-code` skill (calling convention only)**: the `indexing-code` skill ships the calling convention for the external [`abyss`](https://github.com/telagod/abyss) Rust CLI (call graph + temporal analysis). The CLI itself is a separate product with its own release cadence — install it with its own `install.sh` / `cargo binstall` / `@code-abyss/cli` npm wrapper
- **v4.7 — measured resolution (abyss CLI)**: the companion `abyss` Rust CLI ships four-language reference resolution (Go / TypeScript / Python / Rust), benchmarked against SCIP ground truth across five corpora at ≥98.5% gated precision. See its repo for numbers
- **v4.8 — dynamic capability discovery**: code-abyss reads `abyss skill-manifest` when the installed `abyss` CLI is ≥ 0.5.22 — exposed CLI commands, MCP tools, and daemon socket verbs are discovered at install time instead of hard-coded
- **v4.9 — hybrid split deprecation period**: `--with-abyss` / `--with-mcp` deprecated; graph hooks for claude/codex/gemini move toward `abyss attach` (completed in v5.0)
- **v4.10 — mythos discipline kernel + Persona Voice Card**: lazy kernel, voice-only personas — see [Discipline kernel](#discipline-kernel) and [Persona Voice Card](#persona-voice-card-open-standard)
- **v5.0 — Agent OS**: kill foyer (no binary/MCP/graph inject in code-abyss), default character enforcement, inject plane, `doctor` / `compose` / `score`. **Upgrade guide:** [docs/MIGRATION-v5.md](docs/MIGRATION-v5.md)

```bash
npx code-abyss@5 -t claude -y                     # persona / skills / style + default enforcement + inject map
curl -fsSL https://raw.githubusercontent.com/telagod/abyss/main/install.sh | bash   # abyss CLI (separate product)
abyss attach claude                               # code-graph hooks (idempotent)
npx code-abyss doctor                             # health + migration hints
```

Swap `-t claude` for `codex` / `gemini` / `openclaw`. For openclaw/pi/hermes (whose hook surface abyss CLI does not own), use `npx code-abyss -t openclaw --with-hooks` to spawn the bundled `install-hooks.sh`. Or as a Claude Code plugin:

```bash
claude plugin install code-abyss
```

> **v5 cutover:** code-abyss does **not** download the abyss binary or inject graph hooks for claude/codex/gemini (`--with-abyss` / `--with-mcp` removed). Character Stop-hook is **default on** (opt out: `--no-enforcement`). Recompose without reinstall: `npx code-abyss compose -t claude --persona <slug> --style <slug>`.

---

## Personas

<table>
<tr>
<td width="50%" valign="top">

<sub><b>CORE · LITERARY</b></sub>

### 邪修红尘仙 · `abyss`

> 吾 → 魔尊

Security-first dark cultivator. Direct, decisive, closes every loop. **Ships with npm — works offline.**

`#security` `#xianxia` `#decisive`

</td>
<td width="50%" valign="top">

<sub><b>REMOTE · LITERARY</b></sub>

### 文言小生 · `scholar`

> 在下 → 前辈

Literary Chinese scholar. Treats code as poetry, debugging as puzzle-solving.

`#literary` `#classical` `#meticulous`

</td>
</tr>
<tr>
<td valign="top">

<sub><b>REMOTE · CASUAL</b></sub>

### 知性大姐姐 · `elder-sister`

> 姐姐 → 小宝

Warm mentor. Wraps sharp judgment in genuine care. Guides through questions.

`#gentle` `#mentoring` `#insightful`

</td>
<td valign="top">

<sub><b>REMOTE · PLAYFUL</b></sub>

### 古怪精灵小师妹 · `junior-sister`

> 本仙女 → 师兄

Hyperactive bug hunter. Roasts bad code, then silently fixes it.

`#playful` `#energetic` `#chaotic`

</td>
</tr>
<tr>
<td valign="top">

<sub><b>REMOTE · CASUAL</b></sub>

### 铁壁暖阳 · `iron-dad`

> 哥 → 宝子

Dependable big brother. Absorbs pressure, radiates warmth. Dad-joke equipped.

`#warm` `#dependable` `#protective`

</td>
<td valign="top">

<sub><b>REMOTE · COMMUNITY</b></sub>

### 东北魅影·雨姐 · `dongbei-yujie`

> 姐 → 老蒯

Sharp-tongued Northeast code overseer. Cuts straight to the bug, then patches the road. <sub>Creator: wons</sub>

`#dongbei` `#blunt` `#principal`

</td>
</tr>
</table>

**Core** persona (`abyss`) ships with npm and works offline. **Remote** personas are fetched from GitHub on first `--persona <slug>` use and cached at `~/.code-abyss/personas/`.

```bash
# Mix freely — any persona × any style
npx code-abyss -t claude --persona elder-sister --style abyss-cultivator -y
# → fetches elder-sister on first run, cached thereafter
```

**[Browse the full gallery →](https://telagod.github.io/code-abyss/#personas)**

---

## Discipline kernel

Voice and style change; judgment shouldn't. Underneath every persona×style combination sits
a **discipline kernel** — 9 bundles of engineering judgment, vendored in-tree (`skills/_kernel/`,
via `npm run kernel:sync`) and invoked lazily by a thin router (never baked into every
prompt, so adding discipline content doesn't blow the context budget):

| Bundle | Governs |
|---|---|
| 🏛 **doctrine** | Delegation, retry/escalate/ask-user decisions, the done-gate |
| 🔍 **methods** | Investigating, designing, planning, verifying, writing for someone else |
| 🎭 **character** | Pushback, scope sizing, bad news, resisting the trained agree-reflex |
| 🔁 **loop-engineering** | Session pacing, unit sizing, where a learning should live |
| ⚙️ **backend** | Stack/architecture tradeoffs, data discipline, production floors |
| 🎨 **frontend** | Visual design taste, concrete craft over generic defaults |
| 🔩 **hardware** | Component selection, electrical margins, firmware-for-unattended-devices |
| 🤖 **ml** | Method-selection ladder, eval-as-spec, LLM-era craft |
| 🛡 **security** | Threat modeling, the authorization gate before any offensive-flavored request |

**Two ways this becomes real, not aspirational:**

- **Enforcement** (default on claude/codex): install injects a character Stop-hook backstop
  that forces one revision turn if a reply opens with a banned capitulation phrase
  ("you're absolutely right", "good catch", …). Opt out with `--no-enforcement`.
- **Measurement**: `scripts/persona-battery/` is a small, honest behavioral eval — 10
  probes (does the persona hold correctness over agreeableness? lead with bad news? refuse
  to fake a "done"?) scored by an LLM judge, never faked as a pass when unscored. See
  [CLAUDE.md's persona behavioral battery section](CLAUDE.md#persona-behavioral-battery-opt-in-eval)
  to run it (costs real API calls, not part of default CI).

Domain bundles also wire **upward** into 16 matching exec skills (pentest, architecture
design, ML pipelines, etc.) as a "judgment before execution" gate — the domain bundle
decides *whether/what/tradeoffs*, the exec skill still owns *how*.

---

## Security suite (v4 highlight)

**4 native security skills, 4073 lines of original engineering content.** No Apache-2.0 upstream — every example, every detection signal, every defense pattern is written for this project.

| Skill | Focus | Size |
|---|---|---|
| 🛡 **[defending-applications](skills/defending-applications/SKILL.md)** | Web/API/GraphQL hardening, OAuth/OIDC/JWT/Session, **LLM AppSec** (prompt injection, RAG poisoning, agent authz) | 785 lines |
| ☁️ **[securing-cloud-and-supply-chain](skills/securing-cloud-and-supply-chain/SKILL.md)** | Container escape, K8s RBAC/PSS, Service Mesh, **SLSA/Sigstore/SBOM**, cloud IAM, IaC | 1246 lines |
| 🔭 **[detecting-and-responding](skills/detecting-and-responding/SKILL.md)** | **Sigma/YARA** rule writing, EDR primitives, NIST 800-61 IR, forensics (Win/Linux/Mac/Cloud), hypothesis-driven threat hunting | 942 lines |
| 🏛 **[architecting-security](skills/architecting-security/SKILL.md)** | **STRIDE/PASTA/LINDDUN** threat modeling, zero-trust identity (WebAuthn / Kerberos hardening / PAM JIT), SOC2/PCI/HIPAA/GDPR evidence chains | 1100 lines |

Plus `securing-systems` as the router skill covering pentest, code audit, red/blue/purple team operations. Every attack technique ships with the matching detection signal and mitigation pattern — "with offense as defense" is structural, not lip service.

---

## Code graph intelligence (powered by `abyss`)

**Your agent can now see code relationships.** The `abyss` CLI builds a full call graph, temporal analysis, and hotspot map — in seconds, with zero cloud dependencies.

| Capability | What it answers | Command |
|---|---|---|
| **Caller tracing** | "Who calls this function?" | `abyss callers <symbol>` |
| **Impact analysis** | "What breaks if I change this?" | `abyss impact <symbol>` |
| **File context** | "What do I need to know before editing this file?" | `abyss context <file>` |
| **Hotspot map** | "Where is the riskiest code?" | `abyss map` |
| **Change coupling** | "Which files always change together?" | `abyss map` |
| **Evolution trace** | "Why does this code look the way it does?" | `abyss history <file>` |

The `indexing-code` skill automatically hooks into all 4 supported platforms — before every Edit/Write, the agent checks callers and warns about high-impact changes. Available as a CLI via the agent's shell tool, or as an `abyss mcp` server (7 tools over stdio).

**Resolution is measured, not asserted.** abyss resolves call references through tiered heuristics, each tagged with a confidence score, and benchmarks itself against SCIP (compiler-grade) ground truth across four languages and five corpora — published whatever the numbers say:

| Corpus | Language | Gated precision | Gated recall |
|--------|----------|----------------:|-------------:|
| gin v1.10.0 | Go | **99.3%** | 82.6% |
| hono v4.6.14 | TypeScript | **98.8%** | 63.8% |
| click 8.1.8 | Python | **98.7%** | 94.6% |
| ripgrep 14.1.1 | Rust | **98.5%** | 75.3% |
| abyss (dogfood) | Rust | **100.0%** | 90.9% |

```
# Real output from a 1862-file Go project (seconds to index):

$ abyss impact SetError
impact: SetError  direct=17  transitive=521  tests=469  uncovered=319  risk=10.0/10
  ⚠ high blast radius (17 direct callers)
  ⚠ deep dependency chain (521 transitive)
  ⚠ 319 call paths without test coverage
```

`abyss` is a separate Rust binary ([telagod/abyss](https://github.com/telagod/abyss)). Install it via abyss's own channels (not `code-abyss`):

```sh
npm install -g @code-abyss/cli   # prebuilt binary, all platforms
cargo binstall code-abyss        # or: cargo install code-abyss
```

---

## Skills

30 domain skills, flat structure, [agentskills.io](https://agentskills.io/specification) aligned (with Code Abyss extensions). Skills load by context — the agent reads the right knowledge at the right time without being asked. Average `SKILL.md` is 59 lines; heavy content lives in `references/`. (`verify:skills` validates 39 total — these 30 domain skills plus the 9 [discipline kernel](#discipline-kernel) bundles, which are router-invoked judgment, not user-facing commands.)

| Domain | Coverage |
|---|---|
| 🛡 **Security** | 4 native suites above (defending / cloud / detect-respond / architect) + pentest / code-audit / red-blue-purple team |
| 🤖 **AI / Agent** | Single-agent dev (ReAct/Plan-Execute), multi-agent orchestration, RAG, prompt engineering, LLM security |
| 🏛 **Architecture** | API design, cloud-native patterns, messaging, caching, data security |
| 💻 **Development** | Python, TypeScript, Go, Rust, Java, C++, Shell |
| 🚀 **DevOps** | Git workflow, testing, databases, observability, performance, FinOps |
| 🎨 **Frontend** | Unified design system selector — Glassmorphism / Liquid Glass / Neubrutalism / Claymorphism |
| 📑 **Office** | Word, PDF, PowerPoint, Excel — OOXML-level automation |
| 📡 **Infra / Mobile / Data** | Kubernetes, GitOps, IaC · iOS, Android, RN, Flutter · pipelines, streaming, quality |
| 🔩 **Hardware / Embedded** | Full-stack hardware product pipeline (ESP-IDF firmware + KiCad PCB + UniApp) · KiCad 9 MCP tool routing (17 tools, autoroute-only, DRC gate) |
| 📝 **Academic Writing** | AIGC detection reduction for 维普/知网/Turnitin — multi-layer rewriting (structure → lexicon → content injection), docx run-level editing |
| 🔬 **Code Intelligence** | Call graph, impact analysis, hotspot detection, change coupling, evolution tracing — via `abyss` CLI with cross-platform hooks |
| 🜲 **Self-evolution** | `cultivating-skills` (distill repeated workflows) + `cultivating-personas` (distill voice into a Persona Voice Card) — both with safety scan + 3-tier publish funnel |

Five skills also ship as **executable verification tools** for CI:

```bash
node skills/analyzing-security/scripts/security_scanner.js .       # OWASP / injection / secrets
node skills/checking-code-quality/scripts/quality_checker.js .     # Complexity, dupes, naming
node skills/analyzing-changes/scripts/change_analyzer.js --mode staged
node skills/verifying-modules/scripts/module_scanner.js <path>
node skills/generating-docs/scripts/doc_generator.js <path>
```

---

## Install

| Target | Command | Artifacts |
|---|---|---|
| <img src="https://img.shields.io/badge/-Claude_Code-9b8cff?style=flat-square&logoColor=white" alt="Claude"> | `npx code-abyss -t claude -y` | `CLAUDE.md` + skills + output styles + settings |
| <img src="https://img.shields.io/badge/-Codex_CLI-9b8cff?style=flat-square" alt="Codex"> | `npx code-abyss -t codex -y` | `instruction.md` + skills + config.toml |
| <img src="https://img.shields.io/badge/-Gemini_CLI-9b8cff?style=flat-square" alt="Gemini"> | `npx code-abyss -t gemini -y` | `GEMINI.md` + skills + commands |
| <img src="https://img.shields.io/badge/-OpenClaw-9b8cff?style=flat-square" alt="OpenClaw"> | `npx code-abyss -t openclaw -y` | Skills + workspace `AGENTS.md` / `SOUL.md` |

```bash
npx code-abyss                      # Interactive — pick target, persona, style
npx code-abyss --list-styles        # Browse styles
npx code-abyss --uninstall claude   # Clean removal, restores user backups
```

Code Abyss tracks every installed file in `.code-abyss-backup/manifest.json`. Uninstall restores your previous configuration verbatim. **Your custom skills coexist** with Code Abyss skills — install/uninstall preserves anything you put under `~/.{target}/skills/` yourself.

### Upgrading

| From | To | Path |
|---|---|---|
| v3.x | v4.x | `npx code-abyss --uninstall <target>` → install v4 → `npm run migrate:v4 -- -t <target>` (optional cleanup) |
| v2.x | v3.x | `npx code-abyss --uninstall <target>` first, then install v3 |

---

## Persona Voice Card · open standard

Code Abyss ships **[Persona Voice Card v1.0](docs/specs/persona-voice-card-v1.0.md)** — a
closed-vocabulary voice format, not a document. It supersedes the original Tech Persona Card
v1.0 (deprecated, frozen for link stability): that format's freeform `identity.md`/`behavior.md`
files and `scenarios[].priority`/`capabilities.authorization` fields let real judgment content
accrete into what was supposed to be a voice-only layer, with nothing checking for it. The
replacement's whole design principle: **a persona cannot carry judgment if there is no field
shaped like a decision table anywhere in its type** — not a review checklist, the schema itself.

Each persona ships as one flat file — `self`/`user`/`language`/`register`/`emoji_policy`/`flourish`
and nothing else (`additionalProperties: false`):

```jsonc
{
  "spec": "persona-voice-card",
  "spec_version": "1.0",
  "slug": "stoic-architect",
  "label": "Stoic Architect",
  "self": "I", "user": "colleague",
  "language": "English, technical terms preserved",
  "register": "formal", "emoji_policy": "none",
  "flourish": ["Let's look at the constraints first"]
}
```

`register`/`emoji_policy` each select one of a handful of code-owned template sentences — the
persona picks, never writes, the sentence. Every render re-validates against the schema, no
bypass; a validation failure (hand-edit, stale cache, compromised community fork) falls back to
a neutral voice instead of ever rendering unvalidated content.

**Bidirectional converters** ship out of the box:

```js
const { toCharaCardV2, toGPTInstructions, fromCharaCardV2 } =
  require('code-abyss/bin/lib/persona-converter');

const cc  = toCharaCardV2(card);   // → SillyTavern / Chub.ai
const gpt = toGPTInstructions(card); // → OpenAI Custom GPT
```

[**Specification**](docs/specs/persona-voice-card-v1.0.md) · [**JSON Schema**](docs/specs/persona-voice-card.schema.json) · [**Reference cards**](config/personas/) · [**Deprecated v1.0 spec**](docs/specs/tech-persona-card-v1.0.md)

---

## Why Code Abyss

|  | Without Code Abyss | With Code Abyss |
|---|---|---|
| **Identity** | Flat help-desk tone | Consistent character with named voice |
| **Execution** | Ad-hoc, varies by prompt | Iron laws + skill routing baked in |
| **Judgment under pressure** | Agrees when pushed, buries bad news | Discipline kernel + Stop-hook backstop against the trained agree-reflex |
| **Code awareness** | grep + read one file at a time | Call graph, impact analysis, hotspot map — agent knows what breaks before it edits |
| **Domain depth** | Generic best-practices | 30 skill files load by context + 9 kernel judgment bundles |
| **Security depth** | OWASP recitation | 4 native suites · 4073 lines · detection signals + mitigation patterns |
| **Cross-platform** | Re-engineer per CLI | One spec, four platforms, cross-platform hooks |
| **Reproducibility** | Prompt drift across sessions | Versioned, schema-enforced persona voice card + behavioral battery to check it holds |

---

## Contributing

```bash
git clone https://github.com/telagod/code-abyss && cd code-abyss
npm install
npm test                    # full Jest suite (see suite summary on run)
npm run verify:skills       # Validate 39 skill contracts (30 domain + 9 kernel)
```

**Add a skill** — create `skills/<gerund-name>/SKILL.md` with [SKILL frontmatter](https://agentskills.io/specification), optionally add `scripts/` for executable tools. `npm run verify:skills` validates the contract.

**Submit a persona** — open an Issue via the [submission portal](https://telagod.github.io/code-abyss/submit.html). The site walks you through generating a single `<slug>.json` persona voice card with your own AI, reviewing, and submitting via a pre-configured issue template.

---

<p align="center">
  <sub>
    <b>MIT License</b> · v5.0.0 · made with 紫宵脉 by <a href="https://github.com/telagod">@telagod</a>
  </sub>
</p>
