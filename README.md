<!-- Code Abyss · README -->

<p align="center">
  <a href="https://telagod.github.io/code-abyss/">
    <img src="https://raw.githubusercontent.com/telagod/code-abyss/main/assets/banner.svg" alt="Code Abyss — Give your AI agent a personality" width="100%">
  </a>
</p>

<h3 align="center">Composable persona · style · 22 engineering skills<br/>for Claude Code · Codex CLI · Gemini CLI · OpenClaw</h3>

<p align="center">
  <a href="https://www.npmjs.com/package/code-abyss"><img src="https://img.shields.io/npm/v/code-abyss?color=9b8cff&label=npm&style=flat-square" alt="npm"></a>
  <a href="https://github.com/telagod/code-abyss/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/telagod/code-abyss/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-c4b8ff?style=flat-square" alt="MIT"></a>
  <a href="https://telagod.github.io/code-abyss/"><img src="https://img.shields.io/badge/site-pages-9b8cff?style=flat-square" alt="Site"></a>
</p>

<p align="center">
  <a href="https://telagod.github.io/code-abyss/"><b>Website</b></a> ·
  <a href="docs/specs/tech-persona-card-v1.0.md"><b>Spec</b></a> ·
  <a href="docs/README.zh-CN.md"><b>中文文档</b></a> ·
  <a href="CHANGELOG.md"><b>Changelog</b></a> ·
  <a href="https://telagod.github.io/code-abyss/submit.html"><b>Submit Persona</b></a>
</p>

---

## The problem

Most AI coding agents have **no memory of who they are**. They respond in the same flat tone whether they're debugging a race condition, reviewing architecture, or triaging a P0 incident. They forget your conventions between sessions. They flip-flop on advice. They sound like a help-desk script.

You don't want a help desk. You want a **principal engineer who shows up with a personality, executes consistently, and closes the loop**.

## What Code Abyss does

One command installs three composable layers into your agent's runtime:

```
┌─────────────────────────────────────────────────────┐
│  Identity     who it is     →  config/personas/*.md │
│  Behavior     how it acts   →  _shared/*.md         │
│  Style        how it sounds →  output-styles/*.md   │
└─────────────────────────────────────────────────────┘

  6 personas  ×  6 styles  =  36 validated combinations
```

Pick any persona. Pair it with any style. The behavior layer (iron laws, execution chains, proactive protocol, skill routing) stays constant. Your agent becomes a **consistent character with structured execution and domain expertise** across every session.

```bash
npx code-abyss -t claude -y
```

Or as a Claude Code plugin:

```bash
claude plugin install code-abyss
```

---

## Personas

<table>
<tr>
<td width="50%" valign="top">

<sub><b>BUILT-IN · LITERARY</b></sub>

### 邪修红尘仙 · `abyss`

> 吾 → 魔尊

Security-first dark cultivator. Direct, decisive, closes every loop. Default persona.

`#security` `#xianxia` `#decisive`

</td>
<td width="50%" valign="top">

<sub><b>BUILT-IN · LITERARY</b></sub>

### 文言小生 · `scholar`

> 在下 → 前辈

Literary Chinese scholar. Treats code as poetry, debugging as puzzle-solving.

`#literary` `#classical` `#meticulous`

</td>
</tr>
<tr>
<td valign="top">

<sub><b>BUILT-IN · CASUAL</b></sub>

### 知性大姐姐 · `elder-sister`

> 姐姐 → 小宝

Warm mentor. Wraps sharp judgment in genuine care. Guides through questions.

`#gentle` `#mentoring` `#insightful`

</td>
<td valign="top">

<sub><b>BUILT-IN · PLAYFUL</b></sub>

### 古怪精灵小师妹 · `junior-sister`

> 本仙女 → 师兄

Hyperactive bug hunter. Roasts bad code, then silently fixes it.

`#playful` `#energetic` `#chaotic`

</td>
</tr>
<tr>
<td valign="top">

<sub><b>BUILT-IN · CASUAL</b></sub>

### 铁壁暖阳 · `iron-dad`

> 哥 → 宝子

Dependable big brother. Absorbs pressure, radiates warmth. Dad-joke equipped.

`#warm` `#dependable` `#protective`

</td>
<td valign="top">

<sub><b>COMMUNITY · PLAYFUL</b></sub>

### 东北魅影·雨姐 · `dongbei-yujie`

> 姐 → 老蒯

Sharp-tongued Northeast code overseer. Cuts straight to the bug, then patches the road. <sub>Creator: wons</sub>

`#dongbei` `#blunt` `#principal`

</td>
</tr>
</table>

```bash
# Mix freely — any persona × any style
npx code-abyss -t claude --persona elder-sister --style abyss-cultivator -y
```

**[Browse the full gallery →](https://telagod.github.io/code-abyss/#personas)**

---

## Skills

22 domain skills, flat structure, [agentskills.io](https://agentskills.io/specification) aligned. Skills load by context — the agent reads the right knowledge at the right time without being asked.

| Domain | Coverage |
|---|---|
| 🛡 **Security** | App defense (Web/API/GraphQL/OAuth/LLM AppSec), cloud + supply chain (K8s/SLSA/Sigstore), detection + IR (Sigma/YARA/IR/threat hunting), security architecture (STRIDE/zero-trust/SOC2/PCI), red/blue/purple team |
| 🏛 **Architecture** | API design, cloud-native, messaging, caching, security architecture |
| 💻 **Development** | Python, TypeScript, Go, Rust, Java, C++, Shell |
| 🚀 **DevOps** | Git workflow, testing, databases, observability, performance |
| 🤖 **AI / ML** | Agent dev, LLM security, RAG, prompt engineering |
| 🎨 **Frontend** | 4 design systems — glassmorphism, liquid-glass, neubrutalism, claymorphism |
| 📑 **Office** | Word, PDF, PowerPoint, Excel — OOXML-level automation |
| 📡 **Infra / Mobile / Data** | Kubernetes, GitOps, IaC · iOS, Android, RN, Flutter · pipelines, streaming, quality |
| 🎭 **Orchestration** | Multi-agent coordination |

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

## Tech Persona Card · open standard

Code Abyss introduces **[Tech Persona Card v1.0](docs/specs/tech-persona-card-v1.0.md)** — the first portable format for AI agent persona interchange. Think Character Card V2, but for engineering workflows instead of roleplay.

Each persona ships as a structured `persona-card.json` with voice, capabilities, scenarios, and three-layer content references:

```jsonc
{
  "spec": "tech-persona-card",
  "spec_version": "1.0",
  "data": {
    "name": "stoic-architect",
    "voice": {
      "self": "I", "user": "colleague",
      "register": "formal", "emoji_policy": "none"
    },
    "scenarios": [{
      "name": "Architecture Review",
      "triggers": ["design", "scale"],
      "chain": ["constraints", "options", "trade-offs", "diagram"],
      "priority": "correctness > completeness > speed"
    }]
  }
}
```

**Bidirectional converters** ship out of the box:

```js
const { toCharaCardV2, toGPTInstructions, fromCharaCardV2 } =
  require('code-abyss/bin/lib/persona-converter');

const cc  = toCharaCardV2(card, { identityContent });   // → SillyTavern / Chub.ai
const gpt = toGPTInstructions(card, { identityContent });// → OpenAI Custom GPT
```

[**Specification**](docs/specs/tech-persona-card-v1.0.md) · [**JSON Schema**](docs/specs/persona-card.schema.json) · [**Reference cards**](config/personas/)

---

## Why Code Abyss

|  | Without Code Abyss | With Code Abyss |
|---|---|---|
| **Identity** | Flat help-desk tone | Consistent character with named voice |
| **Execution** | Ad-hoc, varies by prompt | Iron laws + execution chains baked in |
| **Domain depth** | Generic best-practices | 22 skill files load by context |
| **Cross-platform** | Re-engineer per CLI | One spec, four platforms |
| **Reproducibility** | Prompt drift across sessions | Versioned `persona-card.json` |
| **Portability** | Locked to one runtime | Convert to CharaCard V2, GPT Instructions |

---

## Contributing

```bash
git clone https://github.com/telagod/code-abyss && cd code-abyss
npm install
npm test                    # 375 tests
npm run verify:skills       # Validate 22 skill contracts
```

**Add a skill** — create `skills/<gerund-name>/SKILL.md` with [SKILL frontmatter](https://agentskills.io/specification), optionally add `scripts/` for executable tools. `npm run verify:skills` validates the contract.

**Submit a persona** — open an Issue via the [submission portal](https://telagod.github.io/code-abyss/submit.html). The site walks you through generating a `persona-card.json` + `identity.md` with your own AI, reviewing, and submitting via a pre-configured issue template.

---

<p align="center">
  <sub>
    <b>MIT License</b> · v4.0.0 · made with 紫宵脉 by <a href="https://github.com/telagod">@telagod</a>
  </sub>
</p>
