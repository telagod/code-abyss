# Multi-Model Evaluation Protocol (2026-04-23)

## Purpose

This protocol records how to compare model assessments of the skill system without mixing them with benchmark task runs.

Benchmark task runs answer:

- does base+skills improve task execution?

Model review records answer:

- what does a model diagnose about the project?
- which findings are confirmed by source evidence?
- which findings become task cards?

## Record Locations

| Record Type | Location |
|---|---|
| Task benchmark runs | `personal-skill-system/benchmark/runs/` |
| Model project reviews | `personal-skill-system/benchmark/model-reviews/` |
| Historical docs archive | `personal-skill-system/docs/archive/` |

## Required Review Record Fields

| Field | Meaning |
|---|---|
| `review_id` | Stable review id. |
| `model` | Model name. |
| `date` | Review date. |
| `source_doc` | Raw review source, if any. |
| `scope` | What the model reviewed. |
| `verdict` | Short summary. |
| `confirmed_findings` | Claims confirmed by local evidence. |
| `corrected_findings` | Claims that were stale, incomplete, or wrong. |
| `action_cards` | Task cards derived from the review. |
| `confidence` | `high`, `medium`, or `low`. |
| `status` | `imported`, `pending`, `superseded`, or `rejected`. |

## Evaluation Roles

| Model | Best Use |
|---|---|
| Codex | Repository edits, verification, source-grounded implementation. |
| GPT-5.4 | Independent architecture, benchmark, and route-depth critique. |
| GLM | Additional diagnostic perspective, useful when source evidence is checked. |
| Claude | Writing and reasoning review pass, useful for docs and workflow critique. |
| Gemini | Cross-model route and host portability review. |

## Rules

- Do not treat any model review as truth until source evidence confirms it.
- Do not merge model opinions into capability ratings without a task card.
- Do not count review records as benchmark uplift evidence.
- Use review records to create or reprioritize task cards.
- Keep raw review docs immutable; create correction notes instead of rewriting them.

## Immediate Records

The current imported review is:

- `benchmark/model-reviews/glm-5.1-project-diagnosis.review.json`

Pending future reviews:

- GPT-5.4 independent top-tier review
- Claude skill usability review
- Gemini host/runtime portability review

