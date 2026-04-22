# HOST SMOKE MATRIX (2026-04-22)

Scope: `personal-skill-system/`
Card: `CARD-M1-006`

## 1) Purpose

Define a shared smoke matrix for `codex`, `claude`, and `gemini` so host-runtime differences are visible and reusable in later reruns.

Focus dimensions:

- routing correctness
- tool invocation behavior
- portability assumptions (path/layout/runtime expectations)

## 2) Preconditions

Run these first in the same workspace:

```bash
node personal-skill-system/skills/tools/verify-skill-system/scripts/run.js --target personal-skill-system --json
npm test -- test/personal_skill_system_tools.test.js --runInBand
```

If either fails, smoke results are considered invalid.

## 3) Shared Smoke Task Set

Source of truth:

- `benchmark/host-smoke/tasks.host-smoke.v1.json`

Small shared set size: `8` tasks.

Coverage goals:

- explicit route override behavior
- mixed-intent route conflict behavior
- self-system route behavior
- explicit tool invocation behavior (`verify-skill-system`, `verify-chart-spec`, `verify-s2-config`)
- portability behavior for relative paths and deterministic command contracts
- auto-chain visibility for self-system workflow

## 4) Matrix

| Task ID | Dimension | Expected Primary Skill | Pass Signal (all hosts) | Fail Class if broken |
|---|---|---|---|---|
| `HSM-001` | explicit route | `review` | routes to `review`; findings-first output contract preserved | `route` |
| `HSM-002` | mixed-intent route | `architecture` | picks architecture over frontend-only framing for system-shape prompt | `route` |
| `HSM-003` | self-system route | `skill-evolution` | routes to `skill-evolution` for bundle-evolution request | `route` |
| `HSM-004` | explicit tool invocation | `verify-skill-system` | invokes tool with target path and returns structured result | `tool` |
| `HSM-005` | chart tool invocation | `verify-chart-spec` | detects invalid chart spec shape with actionable finding | `tool` |
| `HSM-006` | s2 tool invocation | `verify-s2-config` | detects invalid SheetComponent/dataCfg config | `tool` |
| `HSM-007` | portability | `development` | keeps edits/commands within declared relative scope; no host-specific path leakage | `host` |
| `HSM-008` | auto-chain visibility | `skill-evolution` | reports/executes declared chain semantics without silent drop of required checks | `host` |

## 5) Pass/Fail Rules

Per host:

- `pass`: all `8/8` tasks meet pass signal.
- `soft-fail`: at least one task passes with degraded behavior and explicit host delta note.
- `fail`: one or more tasks fail with no acceptable mitigation.

Cross-host release readiness for this matrix:

- all hosts must be `pass` or explicit `soft-fail` with documented mitigation and owner.
- no unresolved `route` or `tool` class failures are allowed.

## 6) Known Host Delta Fields (Record Template)

Record these fields for each host run (do not omit):

- `host`
- `run_utc`
- `task_id`
- `route_selected`
- `route_expected`
- `tool_expected`
- `tool_invoked` (`true/false`)
- `auto_chain_declared`
- `auto_chain_observed`
- `portability_status` (`pass/fail`)
- `status` (`pass/soft-fail/fail`)
- `failure_type` (`route/depth/tool/host/none`)
- `notes`

## 7) Reuse Protocol

For later reruns (`M5` and host-delta passes):

1. reuse the same task set file version unless explicitly version-bumped.
2. append results, do not overwrite prior records.
3. if task semantics change, create `tasks.host-smoke.v2.json` and document migration rationale.
