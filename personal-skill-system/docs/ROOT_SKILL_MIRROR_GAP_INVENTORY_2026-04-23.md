# Root Skill Mirror Gap Inventory (2026-04-23)

## Scope

Authoritative source:

- `personal-skill-system/skills/`

Root compatibility mirror:

- `skills/`

Comparison method:

1. scan both trees for `SKILL.md`
2. compare relative skill directories
3. compare skill `name -> relPath` pairs to isolate canonical path mismatches

## Count Summary

| Metric | Count | Note |
|---|---:|---|
| Authoritative skill paths | 33 | `personal-skill-system/skills/**/SKILL.md` |
| Root mirror skill paths | 21 | `skills/**/SKILL.md` |
| Missing mirror paths | 18 | Authoritative paths absent from root `skills/` |
| Extra mirror paths | 6 | Root `skills/` paths absent from the authoritative tree |
| Canonical path mismatches | 6 | Same skill name exists in both trees but under different paths |

`Canonical path mismatches` are already included inside the missing/extra path totals.

## Missing From Root Mirror

| Authoritative path |
|---|
| `personal-skill-system/skills/domains/chart-visualization` |
| `personal-skill-system/skills/domains/frontend-design/variants/claymorphism` |
| `personal-skill-system/skills/domains/frontend-design/variants/glassmorphism` |
| `personal-skill-system/skills/domains/frontend-design/variants/liquid-glass` |
| `personal-skill-system/skills/domains/frontend-design/variants/neubrutalism` |
| `personal-skill-system/skills/guards/pre-commit-gate` |
| `personal-skill-system/skills/guards/pre-merge-gate` |
| `personal-skill-system/skills/routers/sage` |
| `personal-skill-system/skills/tools/verify-chart-spec` |
| `personal-skill-system/skills/tools/verify-s2-config` |
| `personal-skill-system/skills/tools/verify-skill-system` |
| `personal-skill-system/skills/workflows/architecture-decision` |
| `personal-skill-system/skills/workflows/bugfix` |
| `personal-skill-system/skills/workflows/investigate` |
| `personal-skill-system/skills/workflows/multi-agent` |
| `personal-skill-system/skills/workflows/review` |
| `personal-skill-system/skills/workflows/ship` |
| `personal-skill-system/skills/workflows/skill-evolution` |

## Extra In Root Mirror

| Root mirror path | Note |
|---|---|
| `skills/` | legacy root-level `sage` router surface |
| `skills/domains/frontend-design/claymorphism` | legacy variant path |
| `skills/domains/frontend-design/glassmorphism` | legacy variant path |
| `skills/domains/frontend-design/liquid-glass` | legacy variant path |
| `skills/domains/frontend-design/neubrutalism` | legacy variant path |
| `skills/orchestration/multi-agent` | legacy orchestration path |

## Same Skill Name, Wrong Canonical Path

| Skill | Authoritative path | Root mirror path |
|---|---|---|
| `sage` | `personal-skill-system/skills/routers/sage` | `skills/` |
| `claymorphism` | `personal-skill-system/skills/domains/frontend-design/variants/claymorphism` | `skills/domains/frontend-design/claymorphism` |
| `glassmorphism` | `personal-skill-system/skills/domains/frontend-design/variants/glassmorphism` | `skills/domains/frontend-design/glassmorphism` |
| `liquid-glass` | `personal-skill-system/skills/domains/frontend-design/variants/liquid-glass` | `skills/domains/frontend-design/liquid-glass` |
| `neubrutalism` | `personal-skill-system/skills/domains/frontend-design/variants/neubrutalism` | `skills/domains/frontend-design/neubrutalism` |
| `multi-agent` | `personal-skill-system/skills/workflows/multi-agent` | `skills/orchestration/multi-agent` |

## Verdict

- root `skills/` is an incomplete compatibility mirror, not a distribution-complete image of the authoritative source
- the highest-value missing slices are `workflows/`, `guards/`, `routers/sage`, and `tools/verify-skill-system`
- frontend design variants and `multi-agent` also require canonical path alignment before completeness checks can pass
