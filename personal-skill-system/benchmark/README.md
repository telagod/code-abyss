# Benchmark Harness Skeleton (vNext M1-001)

Scope: `personal-skill-system/benchmark/`
Status: `scaffold + summary stub`

## Purpose

This tree provides a stable, self-describing benchmark structure for vNext.

It is intentionally minimal in M1-001:

- fixed folder layout
- naming conventions
- placeholder run/result shape
- rerun assumptions

Initial summary generation is now provided by `benchmark/scripts/generate-summary.js`.
Deeper orchestration can be expanded in later cards.

## Folder Layout

- `tasks/`: gold task sets by domain
- `rubrics/`: scoring definitions
- `runs/`: immutable run artifacts
- `summary.schema.json`: JSON schema for summary artifact
- `summary.generated.json`: machine-readable aggregate generated from `runs/`
- `scripts/generate-summary.js`: summary runner stub

## Domain Task Buckets (initial)

- `tasks/architecture/`
- `tasks/development/`
- `tasks/review/`
- `tasks/security/`
- `tasks/ai/`
- `tasks/chart-visualization/`
- `tasks/orchestration/`

## Run Naming Rules

Each run should use:

`runs/<run_id>/`

Recommended `run_id` format:

`run-<utc_ts>-<host>-<model>-<mode>`

Example:

`run-20260422T120000Z-codex-gpt-5.4-base-plus-skills`

Rules:

- use UTC timestamp in `YYYYMMDDTHHMMSSZ`
- use lowercase and hyphen separators
- do not overwrite prior run folders

## Run Folder Contract

Each run folder should contain:

- `run.meta.json`: host/model/config metadata
- `results.ndjson`: one JSON record per task result
- `scorecard.json`: rollup metrics for this run
- `notes.md`: assumptions and anomalies

## Minimal Result Shape

Task-level record keys for `results.ndjson`:

- `task_id`
- `domain`
- `host`
- `model`
- `variant` (`base`, `base-plus-skills`, `stronger-model`)
- `route_expected`
- `route_actual`
- `scores.route_correctness`
- `scores.reasoning_quality`
- `scores.validation_completeness`
- `scores.final_correctness`
- `scores.risk_handling_quality`
- `outcome`
- `failure_type` (`route`, `depth`, `tool`, `host`, `none`)

## Rerun Assumptions

- reruns are required when routing logic or depth modules change in priority domains
- reruns should preserve prior artifacts for traceability
- benchmark claims should cite specific run IDs and summary timestamp

## Summary Artifact Contract

Summary schema:

- `benchmark/summary.schema.json`

Summary generator stub:

- `node personal-skill-system/benchmark/scripts/generate-summary.js`

Optional args:

- `--root <benchmark_root>`
- `--output <summary_file>`

Output:

- rewrites `benchmark/summary.generated.json`
- aggregates per-run metadata from `runs/*/run.meta.json`
- carries score snapshots from `runs/*/scorecard.json`
- computes comparison deltas when matching variant pairs exist
  - `base` vs `base-plus-skills`
  - `base-plus-skills` vs `stronger-model`

## M1-001 Boundaries

This scaffold defines structure and placeholder artifacts only.

Future cards add:

- domain task content (`CARD-M1-003`, `CARD-M1-004`)
- rubric pack details (`CARD-M1-005`)
- richer summary automation and CI integration (follow-up after `CARD-M1-002`)
