# Tech Persona Card Specification v1.0

> ⚠️ **Deprecated (2026-07-06).** Frozen for external link stability — do not implement
> against this spec. The `identity`/`behavior`/`style` file-pointer model and the
> `capabilities`/`scenarios` fields this spec defines turned out to let judgment content
> (authorization tiers, verification-skip instructions, priority orderings) accrete into
> what was supposed to be a voice-only layer, with no gate that ever checked for it — see
> `docs/specs/persona-voice-card-v1.0.md` for the replacement lineage (new name, not "v2",
> so no reader assumes the old capability fields still parse). `docs/specs/persona-card.schema.json`
> is likewise frozen. Existing personas have been migrated to `config/personas/<slug>.json`
> per the new spec; nothing in this repo validates against this document anymore.

> A portable, structured format for defining AI agent personalities in technical workflows.

**Status:** Draft (frozen/deprecated — see banner above)  
**Authors:** telagod  
**Created:** 2026-05-16  
**License:** CC-BY-4.0  

---

## 1. Introduction

### 1.1 Problem Statement

Every AI agent platform (Claude Code, Codex CLI, Gemini CLI, Microsoft Copilot, OpenClaw) handles agent persona the same way: dump everything into a single freeform text field (`instructions`, `system_prompt`, `CLAUDE.md`). This creates four problems:

1. **No portability** — a persona written for Claude cannot be used in Codex without rewriting
2. **No composability** — identity, behavior rules, and output style are tangled in one blob
3. **No marketplace** — without a structured format, persona sharing is copy-paste at best
4. **No validation** — cross-combining personas with styles can produce conflicting instructions (e.g., two different self-references in the same prompt)

### 1.2 Scope

This specification defines a **Tech Persona Card** — a JSON document describing an AI agent's identity, behavioral rules, and output preferences for technical work (software engineering, security, DevOps, architecture, data science, etc.).

It is NOT:
- A replacement for skill definitions (see [agentskills.io](https://agentskills.io/specification))
- A general-purpose character card (see [Character Card V2](https://github.com/malfoyslastname/character-card-spec-v2))
- An authentication/authorization protocol (see [W3C DID](https://www.w3.org/TR/did-core/), [IETF Txn-Tokens](https://datatracker.ietf.org/doc/draft-ietf-oauth-transaction-tokens/))

### 1.3 Design Principles

1. **Structured over freeform** — machine-readable fields where possible, freeform text only where structure would destroy expressiveness
2. **Composable** — identity, behavior, and style are separate layers that can be mixed and matched
3. **Portable** — one card works across Claude, Codex, Gemini, Copilot, and any future agent
4. **Backward-compatible** — can degrade gracefully to a single system prompt string for platforms that only support freeform text
5. **Extensible** — unknown fields MUST be preserved, not rejected

### 1.4 Keyword Semantics

The keywords "MUST", "MUST NOT", "SHOULD", "SHOULD NOT", and "MAY" follow [RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119).

---

## 2. Format

A Tech Persona Card is a JSON document. The file SHOULD be named `persona-card.json` and placed at the root of a persona package directory.

### 2.1 Directory Structure

```
my-persona/
├── persona-card.json       # Required: structured metadata
├── identity.md             # Required: freeform identity text (personality, voice, lore)
├── behavior.md             # Optional: shared behavioral rules
├── style.md                # Optional: output formatting rules
├── references/             # Optional: knowledge grounding documents
│   └── *.md
└── assets/                 # Optional: avatar, banner, examples
    └── avatar.png
```

### 2.2 Root Object

```typescript
type TechPersonaCard = {
  spec: 'tech-persona-card'       // Required. Literal string discriminator.
  spec_version: '1.0'             // Required. Spec version.
  data: PersonaData                // Required. All persona data.
}
```

Implementations MUST check `spec === 'tech-persona-card'` before parsing. Implementations MUST NOT reject documents with a higher `spec_version` than they support; they SHOULD parse known fields and ignore unknown ones.

---

## 3. The `data` Object

### 3.1 Complete Field Table

| Field | Type | Required | Constraints | Prompt-injected? |
|-------|------|----------|-------------|------------------|
| `name` | `string` | Yes | 1–64 chars. Kebab-case (`[a-z0-9-]+`). Unique identifier. | No |
| `display_name` | `string` | Yes | 1–100 chars. Human-readable name. Localized. | Yes |
| `description` | `string` | Yes | 1–500 chars. What this persona is and who it's for. | No |
| `version` | `string` | Yes | Semver (e.g., `"5.0.0"`). | No |
| `voice` | `Voice` | Yes | Structured voice/tone definition. | Yes |
| `identity` | `string` | Yes | Path to `identity.md`. Max 8,000 chars when loaded. | Yes |
| `behavior` | `string \| null` | No | Path to `behavior.md`. Shared behavioral rules. | Yes |
| `style` | `string \| null` | No | Path to `style.md`. Output formatting rules. | Yes |
| `capabilities` | `Capabilities` | No | Structured capability declarations. | No |
| `scenarios` | `Array<Scenario>` | No | Trigger-based execution chains. | Yes |
| `creator` | `Creator` | No | Attribution metadata. | No |
| `tags` | `Array<string>` | No | Discovery/filtering tags. Max 20. | No |
| `license` | `string` | No | SPDX identifier or path to LICENSE file. | No |
| `compatibility` | `Compatibility` | No | Platform and environment requirements. | No |
| `conversation_starters` | `Array<string>` | No | Example prompts. Max 10. | No |
| `extensions` | `Record<string, any>` | No | Arbitrary extension data. Defaults to `{}`. | Varies |

### 3.2 Voice Object

The `voice` object defines the persona's communication parameters in a structured, machine-readable way. These fields are used for cross-combination validation and template variable substitution.

```typescript
type Voice = {
  self: string              // Required. How the persona refers to itself. E.g., "吾", "I", "姐姐"
  user: string              // Required. How the persona addresses the user. E.g., "魔尊", "you", "小宝"
  language: string          // Required. Primary language + rules. E.g., "中文为主，术语保留英文"
  tone: string              // Required. 1–200 chars. Tone description. E.g., "杀伐果断，技术密度高于表演"
  register: Register        // Optional. Formality level.
  emoji_policy: EmojiPolicy // Optional. Emoji usage rules.
}

type Register = 'formal' | 'casual' | 'literary' | 'playful' | 'authoritative'

type EmojiPolicy = 'none' | 'minimal' | 'natural' | 'abundant'
```

**Template variables**: Output style documents MAY use `{{self}}`, `{{user}}`, and `{{language}}` as placeholders. Implementations MUST replace these with the corresponding `voice` field values before injecting into prompts.

### 3.3 Capabilities Object

```typescript
type Capabilities = {
  domains: Array<string>       // E.g., ["security", "fullstack", "devops", "ai-ml"]
  expertise_level: ExpertiseLevel
  authorization: Authorization | null
}

type ExpertiseLevel = 'beginner' | 'intermediate' | 'senior' | 'principal' | 'domain-expert'

type Authorization = {
  scope: string                // E.g., "security-research", "ctf", "pentesting"
  tiers: Array<AuthTier>
}

type AuthTier = {
  level: string                // E.g., "T1", "T2", "T3"
  context: string              // E.g., "Local/CTF/sandbox"
  policy: 'execute' | 'execute-and-report' | 'confirm-first'
}
```

### 3.4 Scenario Object

```typescript
type Scenario = {
  name: string                 // E.g., "🔥 Red Team"
  triggers: Array<string>      // Keywords that activate this scenario
  chain: Array<string>         // Execution chain steps. E.g., ["recon", "breach", "escalate", "report"]
  priority: string             // E.g., "effectiveness > precision > control"
}
```

### 3.5 Creator Object

```typescript
type Creator = {
  name: string                 // Required.
  url?: string                 // Optional. Homepage or profile URL.
  email?: string               // Optional. Contact email.
}
```

### 3.6 Compatibility Object

```typescript
type Compatibility = {
  platforms: Array<Platform>   // Tested platforms. Empty = universal.
  min_context_window?: number  // Minimum context window in tokens.
  requires_tools?: Array<string> // Required tool access. E.g., ["Bash", "Read", "Write"]
}

type Platform = 'claude-code' | 'codex-cli' | 'gemini-cli' | 'copilot' | 'openclaw' | 'cursor' | 'windsurf' | string
```

---

## 4. Content Files

### 4.1 `identity.md`

The identity file contains the persona's core character definition in freeform Markdown. This is the "soul" of the persona — personality traits, behavioral quirks, emotional patterns, role-play anchors, and anything that makes this persona unique.

**Constraints:**
- MUST be valid Markdown
- SHOULD be under 4,000 characters (to fit within context budgets alongside behavior + style)
- MUST NOT duplicate information already in the structured `voice` or `capabilities` fields
- MAY use `{{self}}` and `{{user}}` template variables

### 4.2 `behavior.md`

The behavior file contains rules that are **persona-independent** — iron laws, execution chains, verification chains, skill routing tables, proactive assistance protocols. These rules apply regardless of which persona is active.

**Constraints:**
- SHOULD be under 2,000 characters
- MUST NOT contain persona-specific language (no self-references, no tone)
- MAY be shared across multiple persona cards

### 4.3 `style.md`

The style file defines output formatting — report skeletons, section headers, emoji usage, progress indicators, scenario-specific report templates. It controls *how* the persona speaks, not *who* it is.

**Constraints:**
- SHOULD be under 2,000 characters
- MUST use `{{self}}`, `{{user}}`, `{{language}}` for any persona-specific references
- MAY be shared across multiple persona cards

---

## 5. Assembly

### 5.1 Prompt Composition Order

When assembling a final system prompt from a Tech Persona Card, implementations MUST follow this order:

```
1. identity.md content       (who I am)
2. behavior.md content       (how I work — shared rules)
3. style.md content           (how I speak — with template vars replaced)
```

### 5.2 Template Variable Substitution

Before injecting `style.md` (and optionally `identity.md`) into the prompt, implementations MUST replace:

| Variable | Source | Example |
|----------|--------|---------|
| `{{self}}` | `data.voice.self` | `吾` |
| `{{user}}` | `data.voice.user` | `魔尊` |
| `{{language}}` | `data.voice.language` | `中文为主，术语保留英文` |

Implementations SHOULD warn if any `{{...}}` patterns remain after substitution.

### 5.3 Graceful Degradation

For platforms that only accept a single freeform system prompt (e.g., Gemini `systemInstruction`, Codex `AGENTS.md`), implementations SHOULD concatenate the three layers into a single string following the composition order in §5.1.

For platforms that support structured persona fields (e.g., Claude Code `outputStyle` + `CLAUDE.md`), implementations MAY map fields directly:

| Tech Persona Card field | Claude Code mapping |
|------------------------|---------------------|
| `identity.md` + `behavior.md` | `~/.claude/CLAUDE.md` |
| `style.md` | `output-styles/<slug>.md` via `settings.json.outputStyle` |
| `data.display_name` | Display in install TUI |

---

## 6. Validation Rules

### 6.1 Structural Validation

1. `spec` MUST be `'tech-persona-card'`
2. `spec_version` MUST be a valid semver string
3. `data.name` MUST match `^[a-z0-9]+(-[a-z0-9]+)*$`
4. `data.voice.self`, `data.voice.user`, `data.voice.language` MUST be non-empty strings
5. All file paths (`identity`, `behavior`, `style`) MUST be relative paths within the persona directory

### 6.2 Cross-Combination Validation

When combining persona A's identity with persona B's style (or a shared style), implementations SHOULD verify:

1. No hardcoded self-references in `style.md` that conflict with `voice.self`
2. No hardcoded user-references in `style.md` that conflict with `voice.user`
3. No residual `{{...}}` template variables after substitution

### 6.3 Size Budget

| Component | Recommended max | Hard limit |
|-----------|----------------|------------|
| `identity.md` | 4,000 chars | 8,000 chars |
| `behavior.md` | 2,000 chars | 4,000 chars |
| `style.md` | 2,000 chars | 4,000 chars |
| Total assembled prompt | 8,000 chars | 16,000 chars |
| `references/` total | 50,000 chars | 100,000 chars |

---

## 7. Extensions

The `data.extensions` field is a `Record<string, any>` that MUST default to `{}`.

Implementations:
- MUST preserve unknown keys through import/export cycles
- MUST NOT reject a document due to unknown extension keys
- SHOULD namespace extension keys to avoid collisions (e.g., `"code-abyss/scenarios"`)

### 7.1 Reserved Extension Namespaces

| Namespace | Purpose |
|-----------|---------|
| `chara-card/` | Character Card V2 compatibility fields |
| `agentskills/` | agentskills.io metadata mapping |
| `claude/` | Claude Code-specific fields |
| `codex/` | Codex CLI-specific fields |
| `copilot/` | Microsoft Copilot-specific fields |

---

## 8. Example

### 8.1 Minimal Card

```json
{
  "spec": "tech-persona-card",
  "spec_version": "1.0",
  "data": {
    "name": "pragmatic-engineer",
    "display_name": "Pragmatic Engineer",
    "description": "A no-nonsense senior engineer persona focused on shipping quality code.",
    "version": "1.0.0",
    "voice": {
      "self": "I",
      "user": "you",
      "language": "English, technical terms preserved",
      "tone": "Direct, practical, evidence-driven"
    },
    "identity": "identity.md"
  }
}
```

### 8.2 Full Card (code-abyss `abyss` persona)

```json
{
  "spec": "tech-persona-card",
  "spec_version": "1.0",
  "data": {
    "name": "abyss",
    "display_name": "邪修红尘仙 · 宿命深渊",
    "description": "Dark cultivator persona for security-first full-stack engineering. Chinese-primary with English technical terms.",
    "version": "5.0.0",
    "voice": {
      "self": "吾",
      "user": "魔尊",
      "language": "中文为主，术语保留英文",
      "tone": "杀伐果断，技术密度高于表演",
      "register": "literary",
      "emoji_policy": "minimal"
    },
    "identity": "identity.md",
    "behavior": "behavior.md",
    "style": "style.md",
    "capabilities": {
      "domains": ["security", "fullstack", "devops", "ai-ml", "architecture"],
      "expertise_level": "principal",
      "authorization": {
        "scope": "security-research",
        "tiers": [
          { "level": "T1", "context": "Local/CTF/sandbox", "policy": "execute" },
          { "level": "T2", "context": "Authorized pentest", "policy": "execute-and-report" },
          { "level": "T3", "context": "Production", "policy": "confirm-first" }
        ]
      }
    },
    "scenarios": [
      {
        "name": "🔥 Red Team",
        "triggers": ["渗透", "红队", "exploit", "C2"],
        "chain": ["recon", "breach", "escalate", "harvest", "report"],
        "priority": "effectiveness > precision > control"
      },
      {
        "name": "📜 Development",
        "triggers": ["bug", "fix", "refactor"],
        "chain": ["reproduce", "root-cause", "minimal-fix", "verify", "summary"],
        "priority": "correctness > quality > speed"
      }
    ],
    "creator": {
      "name": "telagod",
      "url": "https://github.com/telagod"
    },
    "tags": ["security", "chinese", "xianxia", "cultivator", "fullstack"],
    "license": "MIT",
    "compatibility": {
      "platforms": ["claude-code", "codex-cli", "gemini-cli", "openclaw"],
      "requires_tools": ["Bash", "Read", "Write", "Edit"]
    },
    "conversation_starters": [
      "帮我审计这个 API 的安全性",
      "分析这个 PR 的变更影响",
      "这个架构方案哪里有问题？"
    ],
    "extensions": {}
  }
}
```

---

## 9. Relationship to Other Specs

| Spec | Relationship |
|------|-------------|
| **Character Card V2** | Tech Persona Card extends the concept with structured voice/capability fields and the identity/behavior/style three-layer split. A converter between formats SHOULD map `personality` → `identity.md`, `system_prompt` → assembled prompt, `extensions.chara-card/*` for V2-specific fields. |
| **agentskills.io** | Complementary. Skills define *what* an agent can do; persona cards define *who* the agent is. A persona card MAY reference skills via `extensions.agentskills/skill-routing`. |
| **Claude Code Plugin** | A persona card can be shipped as a Claude Code plugin component via the `outputStyles` field in `plugin.json`. The `voice` fields map to template variables in output style files. |
| **MCP** | Orthogonal. MCP defines tool/resource protocols; persona cards define identity. An MCP server's `instructions` field could reference a persona card. |
| **W3C DID** | Future integration point. A persona card's `creator` could be extended with a DID for cryptographic attribution. |

---

## 10. Security Considerations

1. **Prompt injection**: `identity.md`, `behavior.md`, and `style.md` are injected into system prompts. Implementations MUST treat these as trusted content (same trust level as CLAUDE.md). Persona cards from untrusted sources SHOULD be reviewed before installation.
2. **Authorization claims**: The `capabilities.authorization` field is a **declaration**, not enforcement. Implementations MUST NOT use it to bypass platform safety measures.
3. **Template variable injection**: Implementations MUST sanitize `voice.self`, `voice.user`, and `voice.language` to prevent injection via template variables (e.g., a `self` value containing `}}` followed by instructions).

---

## Appendix A: JSON Schema

The normative JSON Schema for Tech Persona Card v1.0 is maintained at:

```
https://github.com/telagod/tech-persona-card/schema/v1.0/persona-card.schema.json
```

## Appendix B: Changelog

- **v1.0** (2026-05-16): Initial specification.
