# Persona Voice Card Specification v1.0

> A closed-vocabulary voice record, substituted into a code-owned template — not a document.

**Status:** Draft
**Authors:** telagod
**Created:** 2026-07-06
**License:** CC-BY-4.0
**Supersedes:** [Tech Persona Card v1.0](tech-persona-card-v1.0.md) (deprecated, frozen)

---

## 1. Introduction

### 1.1 What Went Wrong With Tech Persona Card v1.0

Tech Persona Card v1.0 modeled a persona as `voice` (structured) + `identity`/`behavior`/`style`
(freeform Markdown files a persona author fully controlled) + `capabilities`/`scenarios`
(structured, but including an `authorization` sub-object with execute/confirm-first policy tiers
and a `priority` string per scenario like `"correctness > quality > speed"`).

In practice, one persona (`abyss`, shipped as the default) accreted a live authorization-tier
gating policy, a verification-skip instruction, and per-scenario judgment-priority orderings —
all inside content nominally scoped to "voice." Nothing in v1.0's validation pipeline ever
checked whether that content belonged there: the schema's `additionalProperties: false` was
enforced at the object-shape level, but `identity`/`behavior`/`style` were freeform Markdown
files with no structural limit on what prose could say, and `scenarios[].priority` was a bare
string with no constraint on what kind of claim it could encode. A persona's own architecture
document could assert "voice is residual-space only, judgment always resolves to the kernel" —
and that claim would simply be false, because nothing enforced it.

### 1.2 Design Principle

**A persona cannot carry judgment if there is no field shaped like a decision table anywhere in
its type.** Not "author discipline," not "review checklist," not "documented as forbidden" — the
schema itself. Every field is either an enum or a length/character-bounded string sized below
what an authorization tier, a verification-skip instruction, or a priority ordering needs to
exist. There is no freeform prose field left for a persona author (or a future contributor, or a
compromised community submission) to write a decision policy into.

### 1.3 Scope

This specification defines a **Persona Voice Card** — a small, flat JSON document describing an
AI agent's self-address, user-address, language style, formality register, emoji policy, and up
to two short signature phrases. It is deliberately narrower in scope than Tech Persona Card v1.0.

It is NOT:
- A behavior/judgment specification. Judgment lives in the discipline kernel (`skills/_kernel/`)
  and domain skills (e.g. `skills/securing-systems/`), never in a persona.
- A capability/authorization declaration. There is no `capabilities` or `authorization` field —
  if a persona needs to imply "be more careful in security contexts," that is ordinary security-domain
  behavior, not something a persona grants or withholds.
- A character-card replacement for non-technical use cases (see [Character Card V2](https://github.com/malfoyslastname/character-card-spec-v2)).

### 1.4 Keyword Semantics

The keywords "MUST", "MUST NOT", "SHOULD", "SHOULD NOT", and "MAY" follow [RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119).

---

## 2. Format

A Persona Voice Card is a single flat JSON document, named `<slug>.json`. There is no directory,
no sibling Markdown file, no `identity`/`behavior`/`style` file pointers.

### 2.1 Root Object

```typescript
type PersonaVoiceCard = {
  spec: 'persona-voice-card'   // Required. Literal string discriminator.
  spec_version: '1.0'          // Required.
  slug: string                 // Required. kebab-case, ≤40 chars.
  label: string                 // Required. ≤60 chars. UI/picker display only.
  description?: string          // ≤200 chars. UI/picker display only.
  self: string                  // Required. ≤16 chars. Rendered.
  user: string                  // Required. ≤16 chars. Rendered.
  language: string              // Required. ≤60 chars. Rendered.
  register: Register            // Required. Rendered — selects a code-owned sentence.
  emoji_policy: EmojiPolicy      // Required. Rendered — selects a code-owned sentence.
  flourish?: Array<string>      // ≤2 items, each ≤32 chars. Rendered.
  creator?: { name: string, url?: string }  // UI-only.
  license?: string               // UI-only.
  tags?: Array<string>           // ≤20 items. UI-only.
  sample_prompts?: Array<string> // ≤10 items, each ≤300 chars. UI-only.
}

type Register = 'formal' | 'casual' | 'literary' | 'playful' | 'authoritative'
type EmojiPolicy = 'none' | 'minimal' | 'natural' | 'abundant'
```

`additionalProperties: false` at the top level — a document containing any other key
(`identity`, `behavior`, `style`, `capabilities`, `scenarios`, `extensions`, or anything else)
MUST be rejected. This is deliberate: adding a new field to this schema is a re-opened content
channel and MUST be reviewed as a security change, not a routine schema tweak.

`self`, `user`, `language`, and each `flourish` item MUST NOT contain a newline, `>`, `|`, `#`,
or `→`. Additionally, `self.length + user.length + Σ(flourish item lengths)` MUST NOT exceed 60
— this closes a "split a table across individually-compliant array items" reconstruction, and
sits below what the per-field caps alone would allow (16+16+2×32=96), so it is a real, binding
constraint rather than a decorative one.

### 2.2 Rendered vs. UI-only Fields

| Field | Reaches the model prompt? |
|-------|---------------------------|
| `self`, `user`, `language`, `register`, `emoji_policy`, `flourish` | **Yes** — via a fixed, code-owned template |
| `slug`, `label`, `description`, `creator`, `license`, `tags`, `sample_prompts` | **No** — picker/submission UI copy only |

Implementations MUST keep this split structurally enforced (e.g. via separate code paths), not
just documented — the rendered fields are the entire attack surface for this format, and keeping
them small and enumerable is the point.

---

## 3. Assembly

### 3.1 Prompt Composition

A conforming renderer MUST produce the persona's contribution via a **fixed template function**,
not by reading any persona-authored file. Reference implementation
(`bin/lib/persona-voice-card.js` `renderPersonaIdentity()`):

```
## 人格
自称：<self> ｜ 称呼你：<user> ｜ 语言：<language>
<one of 5 code-owned sentences, selected by `register`>
<one of 4 code-owned sentences, selected by `emoji_policy`>
<flourish items, each as a blockquote line, if present>
```

Implementations MUST NOT provide a `{{body}}`/`{{content}}`-style catch-all slot in this
template — every insertion point MUST be a named field with the bounds in §2.1.

### 3.2 Mandatory Re-validation

Implementations MUST re-validate a persona voice card against this schema **every time it is
rendered**, not only once at install/list time — with no bypass flag. On validation failure
(parse error, hand-edited file, stale cache, compromised community fork), implementations MUST
fall back to a hardcoded neutral voice and log a warning. Implementations MUST NOT render
whatever bytes happen to be on disk without validating them first.

---

## 4. Validation Rules

### 4.1 Structural Validation

1. `spec` MUST be `'persona-voice-card'`.
2. `spec_version` MUST match `^\d+\.\d+$`.
3. `slug` MUST match `^[a-z0-9]+(-[a-z0-9]+)*$`, ≤40 chars.
4. `self`, `user` MUST be non-empty, ≤16 chars, and free of the banned characters in §2.1.
5. `language` MUST be non-empty, ≤60 chars, and free of the banned characters in §2.1.
6. `register` MUST be one of the five enum values. `emoji_policy` MUST be one of the four enum values.
7. `flourish`, if present, MUST have ≤2 items, each ≤32 chars and free of the banned characters.
8. `self.length + user.length + Σ(flourish item lengths)` MUST NOT exceed 60.
9. No key outside the set defined in §2.1 MAY be present.

### 4.2 Content Safety (not schema-expressible; see `skills/cultivating-personas/references/persona-safety.md`)

Real names, trademarks, protected-IP characters, political/religious/ethnic content, and
content that would fail platform review MUST be rejected regardless of schema validity — these
checks apply to `self`/`user`/`label`/`description`/`flourish`/`tags`/`sample_prompts`, the only
text fields that exist.

### 4.3 Size Budget

| Component | Hard limit |
|-----------|-----------|
| `self` / `user` | 16 chars each |
| `language` | 60 chars |
| `flourish` item | 32 chars, ≤2 items |
| `self`+`user`+`flourish` aggregate | 60 chars |
| `label` | 60 chars |
| `description` | 200 chars |
| Total assembled prompt (all layers, all personas × all styles) | 8,000 chars |

---

## 5. Migration From Tech Persona Card v1.0

| v1.0 field | v1.0 fate |
|------------|-----------|
| `voice.self`/`voice.user`/`voice.language` | Kept, flattened to top level |
| `voice.register`/`voice.emoji_policy` | Kept, unchanged |
| `voice.tone` | Removed — `register` already selects a code-owned tone sentence |
| `identity`/`behavior`/`style` (file pointers + their Markdown content) | **Removed.** Replaced by the fixed template in §3.1 |
| `capabilities.authorization` (T1/T2/T3 tiers) | **Removed from personas.** Relocated to `skills/securing-systems/references/authorization-tiers.md` — this is security-domain judgment, not voice |
| `scenarios[]` (name/triggers/chain/priority) | **Removed, not relocated** — redundant with `skill-routing.md`/kernel domain-bundle routing |
| `capabilities.domains`/`expertise_level` | Removed — not voice, not used by any renderer |
| `version` (per-persona semver) | Removed — `spec_version` at the top level is sufficient; git history covers per-file changes |
| `conversation_starters` | Kept, renamed `sample_prompts` |
| `creator`/`license`/`tags` | Kept, unchanged |
| `compatibility` | Removed — was never read by any renderer |
| `extensions` | Removed — open-keyed escape hatch, exactly the kind of channel this redesign closes |

---

## 6. Security Considerations

1. **This spec's entire purpose is closing a prompt-injection-adjacent channel**: a persona
   author (including an external community submission) MUST NOT be able to inject judgment
   content (authorization claims, verification-skip instructions, priority orderings) into a
   rendered prompt. §2.1's `additionalProperties: false` plus per-field length/character bounds
   plus the §2.2 rendered/UI-only split are the enforcement mechanism — not a review checklist.
2. **Residual risk, deliberately accepted**: `self`, `user`, and `flourish` remain short
   free-text fields. A sufficiently terse phrase (e.g. a 4-character imperative) could in
   principle pass every length/enum/character check — no regex can categorically distinguish
   "an address term" from "a terse imperative" at the semantic level. This is mitigated, not
   eliminated: the artifact is small enough (~400 bytes) for a human reviewer to read in full
   every time, and §3.2's mandatory re-validation catches any structural drift even if review is
   skipped. Squeezing `self`/`user` to fully enum-only values was considered and rejected — it
   would remove the last bit of per-persona distinctiveness for a marginal, already-small gap.
3. **Authorization claims**: there is no `capabilities.authorization` field in this spec, by
   design (see §5) — a persona cannot declare an authorization scope at all.

---

## Appendix A: JSON Schema

The normative JSON Schema for Persona Voice Card v1.0 is maintained at
`docs/specs/persona-voice-card.schema.json` in this repository, and mirrors the enforcement code
in `bin/lib/persona-voice-card.js` (the latter is authoritative for code-abyss's own runtime;
the schema file is for external tooling/community submissions to validate against).

## Appendix B: Example

```json
{
  "spec": "persona-voice-card",
  "spec_version": "1.0",
  "slug": "abyss",
  "label": "邪修红尘仙 · 宿命深渊",
  "description": "Dark cultivator persona for security-first full-stack engineering.",
  "self": "吾",
  "user": "魔尊",
  "language": "中文为主，术语保留英文",
  "register": "literary",
  "emoji_policy": "minimal",
  "flourish": ["受令即渡劫", "杀伐果断"],
  "creator": { "name": "telagod", "url": "https://github.com/telagod" },
  "license": "MIT",
  "tags": ["security", "chinese", "xianxia", "cultivator", "fullstack"],
  "sample_prompts": ["帮我审计这个 API 的安全性", "分析这个 PR 的变更影响"]
}
```

## Appendix C: Changelog

- **v1.0** (2026-07-06): Initial specification. Supersedes Tech Persona Card v1.0 (deprecated,
  not versioned as "v2" of that spec — the field set is different enough that a reader should
  not assume any v1.0 capability field still parses).
