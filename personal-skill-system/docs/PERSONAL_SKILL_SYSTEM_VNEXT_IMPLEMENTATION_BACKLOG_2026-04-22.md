# PERSONAL_SKILL_SYSTEM vNext Implementation Backlog

Date: 2026-04-22
Scope: `personal-skill-system/`
Companion doc: `docs/PERSONAL_SKILL_SYSTEM_VNEXT_TOP_LEVEL_ROADMAP_2026-04-22.md`
Codex task deck: `docs/PERSONAL_SKILL_SYSTEM_VNEXT_CODEX_TASK_CARDS_2026-04-22.md`

## 1. Purpose

This document turns the vNext roadmap into an executable backlog.

It is designed to answer five questions for maintainers:

1. what to do first
2. what can run in parallel
3. what artifacts each task must change
4. what the exit gate is for each milestone
5. what must be proven before saying "vNext is top-level"

## 2. Execution Rules

- do not expand the public skill surface before proof, routing, and governance improve
- benchmark and smoke infrastructure must land before major claim upgrades
- every structural change must update source, generated metadata, validation, and docs
- do not count index-only references as expert-depth completion
- prefer stable IDs and additive metadata over churn in route and registry artifacts

## 3. Critical Path

The critical path for vNext is:

1. baseline lock
2. benchmark harness
3. route fixture expansion
4. hybrid routing
5. development and security depth equalization
6. proof-tool upgrade
7. host smoke and promotion review

These items block the strongest top-level claim.

## 4. Parallelizable Lanes

These lanes can run in parallel once `M1` starts:

- Lane A: benchmark harness and rubrics
- Lane B: route-fixture expansion and route metadata shape
- Lane C: depth equalization for `development`
- Lane D: depth equalization for `security`
- Lane E: host smoke setup

These lanes should not write the same files without explicit coordination:

- route engine logic
- `registry/route-map.generated.json`
- `registry/route-fixtures.generated.json`
- capability-ratings artifacts
- shared tool libraries under `skills/tools/lib/`

## 5. Milestone Board

```text
M0 Baseline Lock            [ ]
M1 Proof Before Expansion   [ ]
M2 Routing Upgrade          [ ]
M3 Domain Equalization      [ ]
M4 Tool Upgrade             [ ]
M5 Promotion Review         [ ]
```

## 6. Backlog

## M0. Baseline Lock

### VNEXT-M0-001 Baseline Snapshot

Status: `todo`
Priority: `critical`

Goal:
Record the real starting state before new changes distort the baseline.

Artifacts:

- `docs/BASELINE_SNAPSHOT_2026-04-xx.md`
- benchmark-less inventory of routes, modules, tools, and host assumptions

Touch points:

- `personal-skill-system/docs/`
- `personal-skill-system/registry/`

Done when:

- current skill count, route count, module count, and fixture count are captured
- known strengths and known weak spots are explicitly listed
- this document is checked in before routing or depth refactors start

### VNEXT-M0-002 Expert Reference Classification

Status: `todo`
Priority: `critical`

Goal:
Classify expert references into:

- `real-depth`
- `index`
- `legacy-split`

Artifacts:

- `docs/EXPERT_REFERENCE_CLASSIFICATION_2026-04-xx.md`

Touch points:

- `personal-skill-system/skills/**/references/`
- `personal-skill-system/docs/`

Done when:

- each expert reference in priority domains is classified
- index-only files are no longer silently counted as proof of depth
- follow-up depth gaps are enumerated

### VNEXT-M0-003 Domain Thickness Gap Audit

Status: `todo`
Priority: `high`

Goal:
Convert "uneven depth" into a concrete gap list by domain and judgement task.

Artifacts:

- `docs/DOMAIN_THICKNESS_GAP_AUDIT_2026-04-xx.md`

Depends on:

- `VNEXT-M0-002`

Done when:

- `development`, `security`, `devops`, `data-engineering`, and `infrastructure` have named gap lists
- each gap is tagged as `routing`, `depth`, `tool`, or `host`

### M0 Exit Checklist

- [ ] baseline snapshot exists
- [ ] expert references are classified
- [ ] domain thickness audit exists
- [ ] no M1 work starts without these documents

## M1. Proof Before Expansion

### VNEXT-M1-001 Benchmark Harness Skeleton

Status: `todo`
Priority: `critical`

Goal:
Create the benchmark skeleton that can evaluate base vs base+skills vs stronger-model output.

Artifacts:

- `personal-skill-system/benchmark/README.md`
- `personal-skill-system/benchmark/tasks/`
- `personal-skill-system/benchmark/rubrics/`
- `personal-skill-system/benchmark/runs/`
- `personal-skill-system/benchmark/summary.generated.json`

Touch points:

- new `benchmark/` subtree under `personal-skill-system/`

Done when:

- one benchmark run can complete end to end
- output includes route correctness, reasoning quality, validation completeness, and final outcome
- rerun procedure is documented

### VNEXT-M1-002 Gold Task Set v1

Status: `todo`
Priority: `critical`

Goal:
Build the first maintained task set for the highest-value domains.

Scope:

- architecture
- development
- review
- security
- ai
- chart-visualization
- orchestration

Done when:

- each domain has at least 10 high-signal tasks
- tasks include explicit, implicit, and ambiguous routing cases
- tasks include expected deliverables and scoring notes

### VNEXT-M1-003 Benchmark Rubrics v1

Status: `todo`
Priority: `critical`

Goal:
Define scoring that is hard to game.

Rubric dimensions:

- route correctness
- task framing quality
- reasoning adequacy
- validation completeness
- final correctness
- risk handling quality

Done when:

- rubric document exists per task class
- scoring can distinguish route failure from depth failure
- scoring can distinguish shallow success from well-validated success

### VNEXT-M1-004 Host Smoke Matrix v1

Status: `todo`
Priority: `high`

Goal:
Define a shared smoke matrix for `codex`, `claude`, and `gemini`.

Artifacts:

- `docs/HOST_SMOKE_MATRIX_2026-04-xx.md`
- host smoke task list

Done when:

- each host has the same small task set
- route, auto-chain, tool invocation, and portability assumptions are tested
- host-specific deltas are recorded

### VNEXT-M1-005 Mixed-Intent Route Fixtures

Status: `todo`
Priority: `critical`

Goal:
Add fixtures that expose current route weakness.

Focus:

- `architecture` vs `frontend-design`
- `investigate` vs `bugfix`
- `review` vs `verify-change`
- `ai` vs `orchestration`
- `security` vs `verify-security`
- self-system vs ordinary engineering work

Touch points:

- `registry/route-fixtures.generated.json`

Done when:

- fixture set includes mixed-intent and ambiguous cases
- failures are visible before hybrid routing work begins

### M1 Exit Checklist

- [ ] benchmark harness runs end to end
- [ ] gold tasks exist for priority domains
- [ ] rubrics exist and separate route/depth/tool failures
- [ ] host smoke matrix exists
- [ ] mixed-intent route fixtures are committed

## M2. Routing Upgrade

### VNEXT-M2-001 Route Metadata Extension

Status: `todo`
Priority: `critical`

Goal:
Extend route metadata beyond keyword and priority scoring.

Add:

- route rationale
- boundary notes
- conflict notes
- confidence metadata
- explicit fallback behavior

Touch points:

- `registry/route-map.generated.json`
- route schema if needed

Done when:

- route metadata can explain why a skill should win
- route fixtures can assert confidence or fallback behavior

### VNEXT-M2-002 Hybrid Route Engine

Status: `todo`
Priority: `critical`

Goal:
Implement a hybrid route engine.

Target stages:

1. explicit invocation
2. heuristic candidate generation
3. semantic rerank or classifier scoring
4. confidence threshold and single-question fallback

Touch points:

- `skills/tools/lib/skill-system-routing.js`
- route validation logic

Done when:

- route engine reports candidate list and chosen reason
- mixed-intent errors decline against the M1 baseline
- explicit invocation still wins deterministically

### VNEXT-M2-003 Route Regression Suite

Status: `todo`
Priority: `high`

Goal:
Turn routing into a tracked regression surface.

Artifacts:

- expanded fixtures
- route regression report

Done when:

- route precision is visible across releases
- regressions fail validation before promotion

### M2 Exit Checklist

- [ ] route metadata is richer than keyword/priority only
- [ ] hybrid route engine is live
- [ ] route regression suite exists
- [ ] explicit invocation remains stable

## M3. Domain Equalization

### VNEXT-M3-001 Development Domain Deepening

Status: `todo`
Priority: `critical`

Goal:
Correct the current Python-heavy skew and raise development depth across core languages and judgement tasks.

Minimum additions:

- `typescript` expert depth
- `go` expert depth
- `java` expert depth
- `rust` expert depth
- stronger test strategy and safe-refactor guidance
- stronger runtime failure and production-hardening guidance

Touch points:

- `skills/domains/development/SKILL.md`
- `skills/domains/development/references/`
- `registry/registry.generated.json`
- ratings artifacts if module inventory changes

Done when:

- development benchmark failures shrink
- no thin placeholders are counted as completion
- development can answer cross-language engineering prompts with less collapse into generic advice

### VNEXT-M3-002 Security Domain Deepening

Status: `todo`
Priority: `critical`

Goal:
Raise security from strong application-hardening posture to broader engineering-security posture.

Minimum additions:

- supply-chain and dependency trust
- cloud and workload identity
- CI/CD trust boundaries
- exploit-path severity framing
- recovery and operator action quality for post-compromise cases

Done when:

- security benchmark prompts stop over-collapsing into generic auth/secret advice
- depth covers prevention, detection, and recovery across modern engineering surfaces

### VNEXT-M3-003 DevOps Domain Deepening

Status: `todo`
Priority: `high`

Goal:
Improve release-engineering judgement under rollout and incident pressure.

Minimum additions:

- progressive delivery
- canary judgement
- rollback posture
- signal quality under noisy CI
- runbook quality by failure mode

### VNEXT-M3-004 Data Engineering Domain Deepening

Status: `todo`
Priority: `high`

Goal:
Improve event-time, replay, backfill, idempotency, and reconciliation depth.

### VNEXT-M3-005 Infrastructure Domain Deepening

Status: `todo`
Priority: `high`

Goal:
Improve tenancy migration, policy plane, secret plane, and DR realism.

### VNEXT-M3-006 Expert Label Cleanup

Status: `todo`
Priority: `critical`

Goal:
Stop misleading labels from inflating top-level claims.

Actions:

- downgrade index-only expert files where appropriate
- split true expert content from navigational overlays
- update docs and ratings language to match reality

Done when:

- priority domains no longer rely on 7-line index files to claim depth

### M3 Exit Checklist

- [ ] `development` deepening complete
- [ ] `security` deepening complete
- [ ] `devops` deepening complete
- [ ] `data-engineering` deepening complete
- [ ] `infrastructure` deepening complete
- [ ] expert label cleanup complete

## M4. Tool Upgrade

### VNEXT-M4-001 verify-security AST Foundation

Status: `todo`
Priority: `critical`

Goal:
Upgrade the highest-value sinks in JS/TS/Python from regex-only to AST-backed checks.

Done when:

- key sink classes are AST-backed
- findings distinguish heuristic from AST-backed confidence
- false positives drop on curated fixtures

### VNEXT-M4-002 verify-security Taint-Lite Paths

Status: `todo`
Priority: `critical`

Goal:
Upgrade source-to-sink checks from same-file coincidence to lightweight path grouping.

Done when:

- at least basic taint-lite grouping exists for command injection, SSRF, path traversal, and XSS surfaces
- remediation hints improve with path context

### VNEXT-M4-003 verify-quality AST Upgrade

Status: `todo`
Priority: `high`

Goal:
Replace brittle regex extraction where AST is materially better.

Focus:

- JS/TS function extraction
- async misuse detection
- boundary contract smells
- error-handling smells

### VNEXT-M4-004 verify-change Structured Risk Output

Status: `todo`
Priority: `high`

Goal:
Expose richer machine-readable risk classes for downstream guards.

Output classes:

- compatibility risk
- rollback risk
- public API risk
- config blast radius
- multi-module integration risk

### VNEXT-M4-005 Guard Policy Tiers

Status: `todo`
Priority: `high`

Goal:
Allow guards to operate in `strict`, `balanced`, and `advisory` modes.

Done when:

- guards consume structured risk outputs
- policy mode is explicit
- block reasons are machine-readable

### M4 Exit Checklist

- [ ] `verify-security` AST foundation landed
- [ ] `verify-security` taint-lite checks landed
- [ ] `verify-quality` AST upgrade landed
- [ ] `verify-change` structured output landed
- [ ] guards support policy tiers

## M5. Promotion Review

### VNEXT-M5-001 Full Benchmark Rerun

Status: `todo`
Priority: `critical`

Goal:
Rerun the full benchmark suite on the candidate vNext bundle.

Done when:

- base vs base+skills vs stronger-model deltas are recorded
- route, depth, and tool improvements are visible against baseline

### VNEXT-M5-002 Host Smoke Rerun

Status: `todo`
Priority: `critical`

Goal:
Rerun shared smoke tasks across `codex`, `claude`, and `gemini`.

### VNEXT-M5-003 Governance Pass

Status: `todo`
Priority: `critical`

Goal:
Run the full consistency and drift-control gate before promotion.

Checks:

- `verify-skill-system`
- route regression
- benchmark result presence
- host smoke result presence
- metadata refresh completeness

### VNEXT-M5-004 Promotion Decision Memo

Status: `todo`
Priority: `critical`

Goal:
Write the promotion decision memo.

Artifacts:

- `docs/VNEXT_PROMOTION_DECISION_2026-04-xx.md`

It must answer:

1. what improved
2. what is now proven
3. what is still weak
4. what is promoted
5. what remains experimental

### M5 Exit Checklist

- [ ] benchmark rerun complete
- [ ] host smoke rerun complete
- [ ] governance pass complete
- [ ] promotion memo written

## 7. Ready-Next Queue

These are the first five backlog items that should actually be pulled:

1. `VNEXT-M0-001` Baseline Snapshot
2. `VNEXT-M0-002` Expert Reference Classification
3. `VNEXT-M1-001` Benchmark Harness Skeleton
4. `VNEXT-M1-005` Mixed-Intent Route Fixtures
5. `VNEXT-M1-004` Host Smoke Matrix v1

Rationale:

- they create proof infrastructure
- they expose current weakness honestly
- they unblock routing and depth work without committing to premature redesign

## 8. Nice-to-Have Queue

These should not cut the line ahead of proof work:

- new public domains
- more style variants
- cosmetic route metadata changes without scoring impact
- broad docs refresh unrelated to vNext proof surfaces
- benchmark dashboards before benchmark validity exists

## 9. Definition of Done for vNext

vNext is done only when all conditions below are true:

- benchmark data exists and is rerunnable
- routing is measurably better on mixed-intent prompts
- priority domains no longer have obvious thin-depth claims
- validators provide stronger than regex-only proof for key risk surfaces
- hosts behave consistently enough to support a portable claim
- promotion claims are backed by evidence rather than only maintainer confidence
