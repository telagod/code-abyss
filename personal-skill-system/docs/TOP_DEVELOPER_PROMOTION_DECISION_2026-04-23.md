# Top Developer Promotion Decision (2026-04-23)

## Verdict

`top_developer/` is needed, but it is not safe to promote as direct default skills.

Keep it as raw source material and continue extracting its strongest parts into `personal-skill-system` capability modules.

Promotion status: `experimental-source`.

## Current Evidence

| Evidence | Interpretation |
|---|---|
| `top_developer/` has 8 large SKILL.md files. | High-volume source material exists. |
| `registry/top-developer-integration.generated.json` maps 42 modules. | Material has already been partially internalized. |
| `docs/TOP_DEVELOPER_EMBEDDING.md` says direct copy would create overlap and route collisions. | Current architecture already chose extraction over direct exposure. |
| `capability-ratings.generated.json` rates 99 modules top-ready under the current internal frame. | Extracted modules are useful, but the claim is internal and benchmark-light. |
| Several raw top-developer files contain broad "must use" triggers and overlapping architecture claims. | Direct promotion would damage routing precision. |

## Why Not Directly Promote

| Risk | Impact |
|---|---|
| Route collision | Architecture, platform architecture, middleware, performance, QA, and Python prompts overlap existing domains/workflows. |
| Context bloat | Huge monolithic skills load too much non-task-specific text. |
| Fake top-tier claim | Raw claims are not backed by current benchmark runs. |
| Encoding and maintainability issues | Raw files contain garbled text in this workspace and need normalization before distribution. |
| Duplicate surfaces | Existing `architecture`, `development`, `review`, `devops`, `infrastructure`, and `security` skills already own those routes. |

## Optimal Strategy

Use extraction, not direct distribution.

| Step | Policy |
|---|---|
| Keep | Preserve `top_developer/` as raw input and provenance. |
| Split | Extract content by judgement task, not by original file. |
| Normalize | Move useful depth into `references/expert-*.md` under existing skills. |
| Route | Keep user-facing routes stable unless a new first-class domain proves necessary. |
| Rate | Add extracted modules to capability ratings only after review. |
| Benchmark | Promote only after benchmark tasks show uplift. |

## Promotion Gates

| Gate | Required Evidence |
|---|---|
| Encoding gate | Extracted material is readable and normalized. |
| Route gate | No new route creates ambiguous overlap without boundary notes and conflict fixtures. |
| Depth gate | Extracted module is task-shaped and not generic advice. |
| Tool/fixture gate | If runtime logic is introduced, tests exist. |
| Benchmark gate | Relevant gold tasks show base+skills uplift. |
| Host gate | User-invocable surfaces pass host smoke or carry documented host deltas. |

## Near-Term Extraction Targets

| Raw Source | Extract Into | Priority |
|---|---|---|
| `top-performance-optimizer` | `development` performance depth and possibly future `performance` domain | High |
| `top-python-dev` | `development` Python modules | High |
| `top-qa` | `review` and guard policy modules | High |
| platform architect variants | `architecture`, `architecture-decision`, `infrastructure` | Medium |
| middleware evolutionary | `architecture` and `devops` evolution references | Medium |

## Decision

The system needs this material, but not as raw default skills.

Treat `top_developer/` as an evidence source and extraction backlog until every promoted slice passes the gates above.

