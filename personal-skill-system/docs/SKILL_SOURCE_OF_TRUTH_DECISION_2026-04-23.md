# Skill Source Of Truth Decision (2026-04-23)

## Verdict

`personal-skill-system/skills/` is the authoritative skill source.

Root `skills/` is a distribution mirror or compatibility surface, not the place where skill truth should be edited first.

`top_developer/` is raw source material. It should not be exposed as default user-invocable skills until its useful material is split into task-shaped capability modules and validated.

## What "single source of truth" means

A single source of truth is the one place maintainers edit first when changing the skill system.

All other artifacts must be generated from it, mirrored from it, or checked against it.

For this repository, that means:

| Artifact | Role |
|---|---|
| `personal-skill-system/skills/**/SKILL.md` | Authoritative skill definitions. |
| `personal-skill-system/skills/**/references/*` | Authoritative expert depth and workflow detail. |
| `personal-skill-system/skills/**/scripts/*` | Authoritative deterministic tool runtime. |
| `personal-skill-system/registry/*.generated.json` | Generated or synchronized metadata. |
| root `skills/` | Distribution mirror or compatibility copy. |
| `top_developer/` | Raw source material, not direct distribution truth. |
| `package.json` `files` | Packaging policy, not skill truth. |
| `packs/*/manifest.json` | Host file placement policy, not skill truth. |

## Why this shape wins

- The portable 33-skill system already lives under `personal-skill-system/skills`.
- It has generated registry, route-map, route fixtures, capability ratings, packs, and benchmark scaffolding.
- Root `skills/` has only 21 skill files and is missing workflows, guards, the full router, and self-verification.
- Directly editing both trees would create drift.
- Directly publishing `top_developer/` would create route collisions, context bloat, and duplicate architecture/performance/review surfaces.

## Decision Rules

| Rule | Requirement |
|---|---|
| Edit first | New skill work starts in `personal-skill-system/skills`. |
| Mirror later | Root `skills/` is updated only by an explicit mirror/generation step or by a card that declares it as write scope. |
| Validate both | Distribution checks must prove root/package content matches the authoritative source. |
| Generated metadata | Registry, route-map, fixtures, and ratings must not become parallel hand-maintained truth. |
| Raw overlays | `top_developer/` stays raw until split, normalized, routed, tested, and benchmarked. |

## Migration Target

Target state:

```text
personal-skill-system/skills/        # source of truth
personal-skill-system/registry/      # generated/synchronized metadata
personal-skill-system/benchmark/     # proof and evaluation
skills/                              # generated or checked distribution mirror
top_developer/                       # raw source archive / extraction input
```

## Immediate Implementation Cards

| Card | Action |
|---|---|
| `CARD-P0-002` | Inventory root mirror gaps against `personal-skill-system/skills`. |
| `CARD-P0-004` | Define the source-to-package mapping in package policy. |
| `CARD-P0-005` | Add distribution completeness checks. |
| `CARD-P0-006` | Add `npm run verify:skill-system`. |
| `CARD-P1-011` | Generate registry from frontmatter. |
| `CARD-P1-012` | Generate route-map from frontmatter. |

## Non-Goals

- Do not copy all raw `top_developer/` skills into the shipped skill tree.
- Do not make root `skills/` a second editable system.
- Do not claim all shipped skills are absolute top-tier until benchmark and host evidence exists.

