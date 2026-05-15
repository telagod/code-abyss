# Skill Authoring

`skills/**/SKILL.md` is the source of truth for skill metadata. This document keeps the **full** authoring contract out of the runtime prompt path.

## Required frontmatter

```yaml
---
name: verify-quality
description: 代码质量校验关卡。
user-invocable: true
allowed-tools: Bash, Read, Glob
argument-hint: <扫描路径>
---
```

Required:

- `name`
- `description`
- `user-invocable`

Optional:

- `allowed-tools`
- `argument-hint`
- `aliases`

## Runtime inference

- `category` is inferred from the directory prefix:
  - scripted skills → `tool` (inferred by runtimeType)
  - knowledge skills → `domain` (inferred by runtimeType)
  - all skills now flat under `skills/<slug>/`
  - anything else → `root`
- `runtimeType` is inferred from `scripts/*.js`
  - exactly one `.js` → `scripted`
  - no script entry → `knowledge`

## Script rules

- scripted skills must expose exactly one `scripts/*.js` entry
- knowledge skills should not expose runtime scripts
- `run_skill.js` is the only supported scripted runtime entrypoint

## Fail-fast validation

These conditions fail `collectSkills()`, `npm run verify:skills`, and CI:

- missing parseable frontmatter
- missing required fields
- invalid kebab-case `name`
- invalid `allowed-tools`
- duplicate skill names
- multiple `.js` entries under `scripts/`

## Generation chain

1. scan and normalize `skills/**/SKILL.md`
2. filter `user-invocable=true`
3. generate Claude commands
4. install Codex skills under `~/.codex/skills/`
5. execute scripted entries via `run_skill.js`

## Author checklist

- run `npm run verify:skills`
- run targeted Jest suites for install / registry / generation / runtime
- verify no command-name collision
- verify scripted skills have exactly one script entry
