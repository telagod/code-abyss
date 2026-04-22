# PERSONAL_SKILL_SYSTEM vNext Codex Task Cards

Date: 2026-04-22
Scope: `personal-skill-system/`
Companion docs:

- `docs/PERSONAL_SKILL_SYSTEM_VNEXT_TOP_LEVEL_ROADMAP_2026-04-22.md`
- `docs/PERSONAL_SKILL_SYSTEM_VNEXT_IMPLEMENTATION_BACKLOG_2026-04-22.md`

## 1. Purpose

This deck converts the vNext backlog into Codex-ready task cards.

Each card is intended to be:

- bounded enough for one focused Codex implementation pass
- explicit about dependencies and write scope
- explicit about validation and completion evidence
- small enough to avoid "epic disguised as a task"

## 2. How To Use This Deck

For each card:

1. start from the first unblocked card in the recommended wave order
2. give Codex the card ID and card body
3. require Codex to stay inside the declared write scope
4. require Codex to run the declared validation profile
5. do not pull blocked cards early unless the dependency is deliberately waived

Recommended Codex handoff wrapper:

```text
Use skill-evolution for this task card.
Card ID: <CARD-ID>
Read first: <card read list>
Constraints: touch only the declared write scope; keep the route surface stable unless the card says otherwise.
Deliverable: implement the card fully, run the declared validation, and summarize files changed plus residual risk.
```

## 3. Card Field Semantics

- `Size`
  - `S`: one small implementation pass
  - `M`: one medium focused pass, possibly touching several related files
  - `L`: only used if the work is still bounded and has one stable ownership surface
- `Validation Profile`
  - `D`: doc and metadata validation
  - `R`: routing and registry validation
  - `T`: tools, code, and targeted runtime tests
- `Depends On`
  - hard prerequisite cards
- `Write Scope`
  - directories or files Codex is allowed to edit

## 4. Validation Profiles

### D. Doc And Metadata

Use when the card is mainly docs, inventory, or metadata curation.

Minimum validation:

```bash
node personal-skill-system/skills/tools/verify-skill-system/scripts/run.js --target personal-skill-system --json
```

### R. Routing And Registry

Use when the card changes route metadata, fixtures, routing logic, or generated registry artifacts.

Minimum validation:

```bash
node personal-skill-system/skills/tools/verify-skill-system/scripts/run.js --target personal-skill-system --json
npm test -- test/personal_skill_system_tools.test.js --runInBand
```

### T. Tools And Runtime

Use when the card changes analysis libraries, guards, or benchmark runtime code.

Minimum validation:

```bash
node personal-skill-system/skills/tools/verify-skill-system/scripts/run.js --target personal-skill-system --json
npm test -- test/personal_skill_system_tools.test.js --runInBand
```

Add narrower tests if the card itself creates them.

## 5. Recommended Wave Order

### Wave 1: Baseline And Proof Scaffolding

- `CARD-M0-001`
- `CARD-M0-002`
- `CARD-M0-003`
- `CARD-M0-004`
- `CARD-M1-001`
- `CARD-M1-002`
- `CARD-M1-003`
- `CARD-M1-004`
- `CARD-M1-005`
- `CARD-M1-006`
- `CARD-M1-007`

### Wave 2: Routing Upgrade

- `CARD-M2-001`
- `CARD-M2-002`
- `CARD-M2-003`
- `CARD-M2-004`
- `CARD-M2-005`

### Wave 3: Domain Equalization

- `CARD-M3-001`
- `CARD-M3-002`
- `CARD-M3-003`
- `CARD-M3-004`
- `CARD-M3-005`
- `CARD-M3-006`
- `CARD-M3-007`
- `CARD-M3-008`
- `CARD-M3-009`
- `CARD-M3-010`
- `CARD-M3-011`
- `CARD-M3-012`

### Wave 4: Proof Tool Upgrade

- `CARD-M4-001`
- `CARD-M4-002`
- `CARD-M4-003`
- `CARD-M4-004`
- `CARD-M4-005`
- `CARD-M4-006`

### Wave 5: Promotion Review

- `CARD-M5-001`
- `CARD-M5-002`
- `CARD-M5-003`
- `CARD-M5-004`

## 6. Task Cards

## M0. Baseline Lock

### CARD-M0-001 Baseline Inventory Snapshot

- Backlog Source: `VNEXT-M0-001`
- Size: `S`
- Validation Profile: `D`
- Depends On: none
- Read First:
  - `docs/PERSONAL_SKILL_SYSTEM_VNEXT_TOP_LEVEL_ROADMAP_2026-04-22.md`
  - `docs/PERSONAL_SKILL_SYSTEM_VNEXT_IMPLEMENTATION_BACKLOG_2026-04-22.md`
  - `registry/registry.generated.json`
  - `registry/route-map.generated.json`
  - `registry/capability-ratings.generated.json`
- Write Scope:
  - `personal-skill-system/docs/`
- Deliverables:
  - `docs/BASELINE_SNAPSHOT_2026-04-22.md`
- Steps:
  1. Capture current counts for skills, routes, fixtures, packs, and capability modules.
  2. Record current known strengths, known weak spots, and evidence sources.
  3. Record the exact commands used to produce the baseline.
- Done When:
  - baseline counts are explicit
  - strengths and weak spots are evidence-backed
  - document is ready to be referenced by later cards

### CARD-M0-002 Expert Reference Classification Rules

- Backlog Source: `VNEXT-M0-002`
- Size: `S`
- Validation Profile: `D`
- Depends On: `CARD-M0-001`
- Read First:
  - `docs/TOP_DEVELOPER_EMBEDDING.md`
  - `skills/workflows/skill-evolution/references/system-audit-lens.md`
  - `skills/workflows/skill-evolution/references/routing-and-depth-strategy.md`
- Write Scope:
  - `personal-skill-system/docs/`
- Deliverables:
  - `docs/EXPERT_REFERENCE_CLASSIFICATION_RULES_2026-04-22.md`
- Steps:
  1. Define the classification criteria for `real-depth`, `index`, and `legacy-split`.
  2. Add examples from the current bundle for each class.
  3. Define what classes do and do not count as top-level depth evidence.
- Done When:
  - classification rules are crisp enough for later inventory work
  - maintainers can classify a file without ad hoc judgement

### CARD-M0-003 Expert Reference Classification Inventory

- Backlog Source: `VNEXT-M0-002`
- Size: `M`
- Validation Profile: `D`
- Depends On: `CARD-M0-002`
- Read First:
  - `docs/EXPERT_REFERENCE_CLASSIFICATION_RULES_2026-04-22.md`
  - priority-domain references under `skills/domains/` and `skills/workflows/`
- Write Scope:
  - `personal-skill-system/docs/`
- Deliverables:
  - `docs/EXPERT_REFERENCE_CLASSIFICATION_2026-04-22.md`
- Steps:
  1. Inventory expert references in `development`, `security`, `devops`, `data-engineering`, `infrastructure`, `review`, and `ai`.
  2. Classify each reference.
  3. Flag obvious index-only files that are currently inflating depth claims.
- Done When:
  - priority-domain expert references are classified
  - index-like thin spots are visible to future Codex workers

### CARD-M0-004 Domain Thickness Gap Audit

- Backlog Source: `VNEXT-M0-003`
- Size: `M`
- Validation Profile: `D`
- Depends On: `CARD-M0-003`
- Read First:
  - `docs/BASELINE_SNAPSHOT_2026-04-22.md`
  - `docs/EXPERT_REFERENCE_CLASSIFICATION_2026-04-22.md`
- Write Scope:
  - `personal-skill-system/docs/`
- Deliverables:
  - `docs/DOMAIN_THICKNESS_GAP_AUDIT_2026-04-22.md`
- Steps:
  1. For each priority domain, list missing judgement tasks.
  2. Tag each gap as `routing`, `depth`, `tool`, or `host`.
  3. Rank the gaps by severity and frequency.
- Done When:
  - each priority domain has a named gap list
  - M3 cards can point to this audit instead of guessing

## M1. Proof Before Expansion

### CARD-M1-001 Benchmark Folder Scaffold

- Backlog Source: `VNEXT-M1-001`
- Size: `M`
- Validation Profile: `T`
- Depends On: `CARD-M0-001`
- Read First:
  - `docs/PERSONAL_SKILL_SYSTEM_VNEXT_TOP_LEVEL_ROADMAP_2026-04-22.md`
  - `docs/PERSONAL_SKILL_SYSTEM_VNEXT_IMPLEMENTATION_BACKLOG_2026-04-22.md`
- Write Scope:
  - `personal-skill-system/benchmark/`
  - `personal-skill-system/docs/`
- Deliverables:
  - benchmark directory skeleton
  - `benchmark/README.md`
  - placeholder run/result shape
- Steps:
  1. Create the benchmark directory layout.
  2. Define the initial result file schema and folder conventions.
  3. Document rerun assumptions and naming rules.
- Done When:
  - the benchmark tree exists and is self-describing
  - future cards can add tasks and rubrics without inventing structure

### CARD-M1-002 Benchmark Summary Artifact And Runner Stub

- Backlog Source: `VNEXT-M1-001`
- Size: `M`
- Validation Profile: `T`
- Depends On: `CARD-M1-001`
- Read First:
  - files created by `CARD-M1-001`
  - `skills/tools/lib/runtime.js`
- Write Scope:
  - `personal-skill-system/benchmark/`
  - `personal-skill-system/docs/`
  - optionally a new helper under `personal-skill-system/skills/tools/lib/` if needed
- Deliverables:
  - benchmark summary artifact schema
  - runner stub or documented manual bootstrap path
- Steps:
  1. Define how a benchmark run becomes a machine-readable summary.
  2. Add the minimum code or documented stub needed to create that summary.
  3. Keep the first version simple and honest; do not fake automation depth.
- Done When:
  - one empty or sample run can produce a valid summary artifact
  - downstream cards have a stable place to write results

### CARD-M1-003 Gold Tasks Batch A

- Backlog Source: `VNEXT-M1-002`
- Size: `M`
- Validation Profile: `D`
- Depends On: `CARD-M1-001`
- Read First:
  - benchmark README
  - route fixtures
  - roadmap benchmark requirements
- Write Scope:
  - `personal-skill-system/benchmark/tasks/`
- Deliverables:
  - gold task sets for `architecture`, `development`, and `review`
- Steps:
  1. Write at least 10 high-signal tasks per listed domain.
  2. Mix explicit, implicit, and ambiguous prompts.
  3. Include expected deliverable and route expectations.
- Done When:
  - the three domains have usable task sets
  - tasks are benchmarkable, not vague scenario notes

### CARD-M1-004 Gold Tasks Batch B

- Backlog Source: `VNEXT-M1-002`
- Size: `M`
- Validation Profile: `D`
- Depends On: `CARD-M1-001`
- Read First:
  - benchmark README
  - current route-map and trigger casebook
- Write Scope:
  - `personal-skill-system/benchmark/tasks/`
- Deliverables:
  - gold task sets for `security`, `ai`, `chart-visualization`, and `orchestration`
- Steps:
  1. Write at least 10 high-signal tasks per listed domain.
  2. Ensure chart and orchestration tasks are not style-only or generic planning fluff.
  3. Include risk and validation expectations where relevant.
- Done When:
  - these four domains have usable task sets
  - tasks cover the system's most valuable non-core-engineering lifts

### CARD-M1-005 Benchmark Rubric Pack v1

- Backlog Source: `VNEXT-M1-003`
- Size: `M`
- Validation Profile: `D`
- Depends On: `CARD-M1-003`, `CARD-M1-004`
- Read First:
  - all benchmark task sets
  - `docs/PERSONAL_SKILL_SYSTEM_VNEXT_TOP_LEVEL_ROADMAP_2026-04-22.md`
- Write Scope:
  - `personal-skill-system/benchmark/rubrics/`
- Deliverables:
  - rubric docs for route correctness, reasoning quality, validation quality, and final correctness
- Steps:
  1. Define shared rubric language.
  2. Separate route failure, depth failure, tool failure, and host failure.
  3. Avoid rubric language that rewards verbosity instead of correctness.
- Done When:
  - rubrics can score the gold tasks consistently
  - shallow success and well-validated success are distinguishable

### CARD-M1-006 Host Smoke Matrix v1

- Backlog Source: `VNEXT-M1-004`
- Size: `S`
- Validation Profile: `D`
- Depends On: `CARD-M1-001`
- Read First:
  - `docs/TEAM_ONBOARDING_ONE_PAGER.md`
  - `docs/NEWCOMER_OPTIMAL_CALLING_GUIDE.md`
- Write Scope:
  - `personal-skill-system/docs/`
  - `personal-skill-system/benchmark/` if you store smoke tasks there
- Deliverables:
  - `docs/HOST_SMOKE_MATRIX_2026-04-22.md`
  - a small shared host smoke task set
- Steps:
  1. Define the common smoke tasks across `codex`, `claude`, and `gemini`.
  2. Specify what counts as pass/fail for routing, tool invocation, and portability.
  3. Record known host delta fields.
- Done When:
  - host smoke expectations are explicit
  - later rerun cards can reuse the same matrix

### CARD-M1-007 Mixed-Intent Route Fixture Expansion

- Backlog Source: `VNEXT-M1-005`
- Size: `M`
- Validation Profile: `R`
- Depends On: `CARD-M0-001`
- Read First:
  - `registry/route-fixtures.generated.json`
  - `skills/tools/lib/skill-system-routing.js`
  - `docs/SKILL_TRIGGER_CASEBOOK.md`
- Write Scope:
  - `personal-skill-system/registry/route-fixtures.generated.json`
  - related docs if needed
- Deliverables:
  - expanded fixture set for mixed-intent and ambiguous prompts
- Steps:
  1. Add fixtures for domain-adjacent conflicts.
  2. Add fixtures for explicit invocation override behavior.
  3. Add fixtures for self-system vs ordinary engineering queries.
- Done When:
  - current heuristic routing shows its real weak spots
  - M2 cards have a stronger regression surface to target

## M2. Routing Upgrade

### CARD-M2-001 Route Metadata Extension

- Backlog Source: `VNEXT-M2-001`
- Size: `M`
- Validation Profile: `R`
- Depends On: `CARD-M1-007`
- Read First:
  - `registry/route-map.generated.json`
  - `skills/tools/lib/skill-system-routing.js`
  - benchmark task/rubric docs
- Write Scope:
  - `personal-skill-system/registry/route-map.generated.json`
  - route schema files if needed
  - docs describing route fields
- Deliverables:
  - extended route metadata fields for rationale, confidence, and fallback
- Steps:
  1. Define the metadata shape.
  2. Keep it backward-compatible where possible.
  3. Document field semantics so future route changes stay consistent.
- Done When:
  - route entries can express more than keyword and priority
  - later route engine cards have a stable metadata contract

### CARD-M2-002 Route-Map Enrichment Pass

- Backlog Source: `VNEXT-M2-001`
- Size: `M`
- Validation Profile: `R`
- Depends On: `CARD-M2-001`
- Read First:
  - updated route-map schema/shape
  - `skills/routers/sage/SKILL.md`
- Write Scope:
  - `personal-skill-system/registry/route-map.generated.json`
- Deliverables:
  - populated metadata for all routed skills
- Steps:
  1. Add rationale, conflict notes, and fallback-related fields to each route.
  2. Keep route surface stable; do not add new public skills here.
  3. Ensure explicit invocation behavior remains unambiguous.
- Done When:
  - route-map entries are enriched consistently
  - missing metadata does not block later route logic

### CARD-M2-003 Routing Library Refactor For Candidate Reasoning

- Backlog Source: `VNEXT-M2-002`
- Size: `M`
- Validation Profile: `R`
- Depends On: `CARD-M2-002`
- Read First:
  - `skills/tools/lib/skill-system-routing.js`
  - route fixtures
- Write Scope:
  - `personal-skill-system/skills/tools/lib/skill-system-routing.js`
  - related tests
- Deliverables:
  - candidate generation and reason reporting inside the route library
- Steps:
  1. Separate candidate generation from final selection.
  2. Expose why a route candidate scored well.
  3. Preserve explicit invocation precedence.
- Done When:
  - the library can return ranked candidates and selection reasons
  - route behavior is more explainable than before

### CARD-M2-004 Semantic Rerank, Confidence, And Fallback

- Backlog Source: `VNEXT-M2-002`
- Size: `L`
- Validation Profile: `R`
- Depends On: `CARD-M2-003`
- Read First:
  - updated routing library
  - roadmap routing target design
- Write Scope:
  - `personal-skill-system/skills/tools/lib/skill-system-routing.js`
  - route docs and fixtures
- Deliverables:
  - semantic rerank or classifier stage
  - confidence threshold behavior
  - one-question fallback path
- Steps:
  1. Add the rerank/classifier stage in the smallest honest way available.
  2. Surface confidence explicitly.
  3. Route to a single clarification question only when confidence is below threshold.
- Done When:
  - mixed-intent errors decline against the baseline fixture set
  - fallback behavior is explicit and testable

### CARD-M2-005 Route Regression Reporting

- Backlog Source: `VNEXT-M2-003`
- Size: `S`
- Validation Profile: `R`
- Depends On: `CARD-M2-004`
- Read First:
  - route fixtures
  - `skills/tools/lib/skill-system-registry.js`
- Write Scope:
  - route validation code
  - docs or artifacts for regression reporting
- Deliverables:
  - route regression output that maintainers can compare across releases
- Steps:
  1. Add a compact report or summary path.
  2. Ensure fixture regressions are visible as a release signal.
  3. Do not overbuild dashboards.
- Done When:
  - route regressions are easy to detect
  - promotion review can cite route evidence directly

## M3. Domain Equalization

### CARD-M3-001 Development Depth Pack A

- Backlog Source: `VNEXT-M3-001`
- Size: `M`
- Validation Profile: `D`
- Depends On: `CARD-M0-004`
- Read First:
  - `skills/domains/development/SKILL.md`
  - `docs/DOMAIN_THICKNESS_GAP_AUDIT_2026-04-22.md`
- Write Scope:
  - `personal-skill-system/skills/domains/development/`
- Deliverables:
  - expert references for `typescript` and `go`
  - updates to development domain routing into those references
- Steps:
  1. Add the two new expert references.
  2. Keep them task-shaped, not encyclopedic.
  3. Update the domain skill read list only where necessary.
- Done When:
  - development no longer collapses TypeScript and Go prompts into generic Python-shaped advice

### CARD-M3-002 Development Depth Pack B

- Backlog Source: `VNEXT-M3-001`
- Size: `M`
- Validation Profile: `D`
- Depends On: `CARD-M3-001`
- Read First:
  - development domain references
  - baseline depth audit
- Write Scope:
  - `personal-skill-system/skills/domains/development/`
- Deliverables:
  - expert references for `java` and `rust`
- Steps:
  1. Add `java` and `rust` depth.
  2. Focus on design and runtime judgement, not syntax tutorials.
  3. Keep naming and structure consistent with the existing development domain.
- Done When:
  - the language-depth set covers four major non-Python engineering paths

### CARD-M3-003 Development Engineering-Depth Pack

- Backlog Source: `VNEXT-M3-001`
- Size: `M`
- Validation Profile: `D`
- Depends On: `CARD-M3-002`
- Read First:
  - current development references
  - review and bugfix references where overlaps exist
- Write Scope:
  - `personal-skill-system/skills/domains/development/`
- Deliverables:
  - stronger references for test strategy, safe refactor, runtime failure handling, and production hardening
- Steps:
  1. Add or deepen missing engineering judgement surfaces.
  2. Remove overreliance on index-style placeholders.
  3. Avoid duplicating `review` or `bugfix` responsibilities.
- Done When:
  - development can give stronger advice on refactor safety and runtime behavior, not only code-shape topics

### CARD-M3-004 Security Depth Pack A

- Backlog Source: `VNEXT-M3-002`
- Size: `M`
- Validation Profile: `D`
- Depends On: `CARD-M0-004`
- Read First:
  - `skills/domains/security/SKILL.md`
  - baseline and gap audit docs
- Write Scope:
  - `personal-skill-system/skills/domains/security/`
- Deliverables:
  - security references for supply-chain trust and cloud/workload identity
- Steps:
  1. Add supply-chain and dependency trust guidance.
  2. Add workload identity and cloud trust-boundary guidance.
  3. Keep the references aligned with existing security posture language.
- Done When:
  - security depth is less limited to app-layer auth and secrets

### CARD-M3-005 Security Depth Pack B

- Backlog Source: `VNEXT-M3-002`
- Size: `M`
- Validation Profile: `D`
- Depends On: `CARD-M3-004`
- Read First:
  - security domain references
  - devops and infrastructure overlap areas
- Write Scope:
  - `personal-skill-system/skills/domains/security/`
- Deliverables:
  - references for CI/CD trust boundaries and exploit-path severity framing
- Steps:
  1. Add CI/CD abuse and trust-boundary guidance.
  2. Add exploit-path severity judgement rules.
  3. Keep overlap with `devops` explicit rather than duplicated blindly.
- Done When:
  - security can reason about build/release trust, not only runtime controls

### CARD-M3-006 Security Depth Pack C

- Backlog Source: `VNEXT-M3-002`
- Size: `S`
- Validation Profile: `D`
- Depends On: `CARD-M3-005`
- Read First:
  - current recovery and response references
- Write Scope:
  - `personal-skill-system/skills/domains/security/`
- Deliverables:
  - stronger recovery and operator-action reference content
- Steps:
  1. Deepen post-compromise recovery judgement.
  2. Add operator action quality and recovery sequencing.
  3. Keep response guidance operational rather than theatrical.
- Done When:
  - the security domain covers prevention, detection, and recovery more evenly

### CARD-M3-007 DevOps Depth Pack

- Backlog Source: `VNEXT-M3-003`
- Size: `M`
- Validation Profile: `D`
- Depends On: `CARD-M0-004`
- Read First:
  - `skills/domains/devops/SKILL.md`
  - release-related review references
- Write Scope:
  - `personal-skill-system/skills/domains/devops/`
- Deliverables:
  - deeper references for progressive delivery, canary judgement, rollback posture, signal quality, and runbooks
- Steps:
  1. Add or deepen the listed DevOps judgement surfaces.
  2. Keep release-engineering logic distinct from architecture and review.
  3. Make rollout and rollback reasoning concrete.
- Done When:
  - DevOps depth supports release-grade prompts with fewer generic answers

### CARD-M3-008 Data Engineering Depth Pack

- Backlog Source: `VNEXT-M3-004`
- Size: `M`
- Validation Profile: `D`
- Depends On: `CARD-M0-004`
- Read First:
  - `skills/domains/data-engineering/SKILL.md`
  - gap audit
- Write Scope:
  - `personal-skill-system/skills/domains/data-engineering/`
- Deliverables:
  - deeper references for event-time, replay, backfill, idempotency, reconciliation, and warehouse cost/perf
- Steps:
  1. Add the missing high-value operational judgement surfaces.
  2. Keep batch and streaming concerns clearly separated where needed.
  3. Preserve concise domain entry points.
- Done When:
  - data-engineering can handle modern pipeline tradeoffs beyond surface ETL advice

### CARD-M3-009 Infrastructure Depth Pack

- Backlog Source: `VNEXT-M3-005`
- Size: `M`
- Validation Profile: `D`
- Depends On: `CARD-M0-004`
- Read First:
  - `skills/domains/infrastructure/SKILL.md`
  - current infra references
- Write Scope:
  - `personal-skill-system/skills/domains/infrastructure/`
- Deliverables:
  - deeper references for multi-env policy, secret plane, tenancy migration, and DR realism
- Steps:
  1. Add the listed infra judgement surfaces.
  2. Keep identity-plane overlap with security explicit.
  3. Make DR guidance drill-oriented, not slogan-oriented.
- Done When:
  - infrastructure depth is less abstract and more operational

### CARD-M3-010 Expert Label Cleanup

- Backlog Source: `VNEXT-M3-006`
- Size: `S`
- Validation Profile: `D`
- Depends On: `CARD-M3-003`, `CARD-M3-006`, `CARD-M3-007`, `CARD-M3-008`, `CARD-M3-009`
- Read First:
  - expert reference classification docs
  - updated domain references
- Write Scope:
  - `personal-skill-system/skills/**/references/`
  - `personal-skill-system/docs/`
- Deliverables:
  - corrected labels and navigational overlays
- Steps:
  1. Rename or reframe index-only expert files where necessary.
  2. Keep machine-readable IDs stable if possible.
  3. Update docs that overclaim depth based on thin index files.
- Done When:
  - top-level claims are no longer propped up by mislabeled thin files

### CARD-M3-011 Registry And Ratings Sync After Depth Changes

- Backlog Source: `VNEXT-M3-006`
- Size: `S`
- Validation Profile: `R`
- Depends On: `CARD-M3-010`
- Read First:
  - `registry/registry.generated.json`
  - `registry/capability-ratings.generated.json`
  - depth-related docs
- Write Scope:
  - `personal-skill-system/registry/`
  - related docs that summarize ratings
- Deliverables:
  - synced registry and capability-rating artifacts
- Steps:
  1. Update registry or generated records to reflect new modules.
  2. Update ratings language to match the corrected depth posture.
  3. Keep source-of-truth consistency explicit.
- Done When:
  - registry, ratings, and docs no longer drift after equalization work

### CARD-M3-012 Domain Benchmark Delta Pass

- Backlog Source: `VNEXT-M3-001` through `VNEXT-M3-006`
- Size: `S`
- Validation Profile: `D`
- Depends On: `CARD-M3-011`
- Read First:
  - benchmark tasks and rubrics
  - all updated domain docs
- Write Scope:
  - `personal-skill-system/benchmark/runs/`
  - `personal-skill-system/docs/`
- Deliverables:
  - a compact delta note on whether domain equalization reduced benchmark-attributed depth gaps
- Steps:
  1. Rerun or simulate the benchmark pass on updated priority domains.
  2. Record the delta against baseline.
  3. Identify any remaining thin spots before M4 starts.
- Done When:
  - there is evidence that depth changes improved the targeted domains

## M4. Proof Tool Upgrade

### CARD-M4-001 verify-security Result Model And AST Foundation

- Backlog Source: `VNEXT-M4-001`
- Size: `L`
- Validation Profile: `T`
- Depends On: `CARD-M1-001`
- Read First:
  - `skills/tools/lib/security-analysis.js`
  - current security tests
- Write Scope:
  - `personal-skill-system/skills/tools/lib/security-analysis.js`
  - related helper files
  - tests
- Deliverables:
  - result model that can distinguish heuristic and AST-backed findings
  - AST-backed detection foundation for core JS/TS/Python sinks
- Steps:
  1. Introduce finding metadata for confidence/source kind.
  2. Add AST-backed detection for the highest-value sink classes first.
  3. Preserve existing heuristic coverage where AST is not yet available.
- Done When:
  - key findings can distinguish heuristic vs AST-backed confidence
  - the tool is stronger without pretending to prove more than it can

### CARD-M4-002 verify-security Taint-Lite Grouping And Fixtures

- Backlog Source: `VNEXT-M4-002`
- Size: `M`
- Validation Profile: `T`
- Depends On: `CARD-M4-001`
- Read First:
  - updated security-analysis code
  - existing security fixture tests
- Write Scope:
  - `personal-skill-system/skills/tools/lib/security-analysis.js`
  - security-related tests/fixtures
- Deliverables:
  - lightweight source-to-sink grouping for command injection, SSRF, path traversal, and XSS
  - stronger fixture coverage
- Steps:
  1. Improve same-file coincidence into grouped path reasoning.
  2. Add fixtures that show the difference.
  3. Keep the implementation lightweight and auditable.
- Done When:
  - remediation hints gain path context
  - false positives and false confidence both decrease

### CARD-M4-003 verify-quality AST Extraction And Stronger Rules

- Backlog Source: `VNEXT-M4-003`
- Size: `M`
- Validation Profile: `T`
- Depends On: `CARD-M1-001`
- Read First:
  - `skills/tools/lib/quality-analysis.js`
  - current tests in `test/personal_skill_system_tools.test.js`
- Write Scope:
  - `personal-skill-system/skills/tools/lib/quality-analysis.js`
  - related tests
- Deliverables:
  - AST-backed JS/TS function extraction
  - stronger async misuse, boundary contract, and error-handling checks
- Steps:
  1. Replace brittle regex extraction where AST meaningfully improves signal.
  2. Add the higher-value rules.
  3. Reduce noise from generated or boilerplate code if feasible in scope.
- Done When:
  - verify-quality is stronger on modern JS/TS without a large noise spike

### CARD-M4-004 verify-change Structured Risk Output

- Backlog Source: `VNEXT-M4-004`
- Size: `M`
- Validation Profile: `T`
- Depends On: `CARD-M1-001`
- Read First:
  - `skills/tools/lib/change-analysis.js`
  - `skills/tools/lib/gate-analysis.js`
- Write Scope:
  - `personal-skill-system/skills/tools/lib/change-analysis.js`
  - related tests
- Deliverables:
  - machine-readable risk classes for compatibility, rollback, public API, config blast radius, and integration risk
- Steps:
  1. Extend the change-analysis result structure.
  2. Preserve existing summary behavior where possible.
  3. Add targeted tests for the new structured output.
- Done When:
  - guards can consume richer risk output without scraping strings

### CARD-M4-005 Guard Policy Tiers And Structured Consumption

- Backlog Source: `VNEXT-M4-005`
- Size: `M`
- Validation Profile: `T`
- Depends On: `CARD-M4-004`
- Read First:
  - `skills/tools/lib/gate-analysis.js`
  - guard scripts under `skills/guards/`
- Write Scope:
  - `personal-skill-system/skills/tools/lib/gate-analysis.js`
  - guard scripts
  - tests
- Deliverables:
  - `strict`, `balanced`, and `advisory` guard modes
  - guard logic based on structured risk outputs
- Steps:
  1. Add policy tiers.
  2. Teach guards to consume structured risk classes.
  3. Keep block reasons machine-readable and human-readable.
- Done When:
  - guard behavior is policy-driven and auditable
  - raw warning count is no longer the only block mechanism

### CARD-M4-006 Validator Regression Tests And Tool Docs

- Backlog Source: `VNEXT-M4-001` through `VNEXT-M4-005`
- Size: `S`
- Validation Profile: `T`
- Depends On: `CARD-M4-005`
- Read First:
  - updated tool libraries and tests
  - `skills/tools/verify-security/SKILL.md`
  - `skills/tools/verify-quality/SKILL.md`
  - `skills/tools/verify-change/SKILL.md`
- Write Scope:
  - tool docs
  - tests
- Deliverables:
  - regression coverage for new validator behavior
  - doc updates reflecting confidence/source-kind semantics and policy tiers
- Steps:
  1. Add missing regression tests.
  2. Update docs to reflect the stronger but still bounded proof model.
  3. Make sure tools do not overclaim certainty.
- Done When:
  - regression coverage exists for the upgraded proof surfaces
  - tool docs match actual runtime behavior

## M5. Promotion Review

### CARD-M5-001 Full Benchmark Rerun And Result Publication

- Backlog Source: `VNEXT-M5-001`
- Size: `M`
- Validation Profile: `D`
- Depends On: `CARD-M3-012`, `CARD-M4-006`
- Read First:
  - benchmark tasks
  - rubrics
  - existing run artifacts
- Write Scope:
  - `personal-skill-system/benchmark/runs/`
  - `personal-skill-system/benchmark/summary.generated.json`
  - `personal-skill-system/docs/`
- Deliverables:
  - full rerun results for the candidate vNext bundle
- Steps:
  1. Run or record the benchmark pass for base, base+skills, and stronger-model comparisons.
  2. Publish the results in the agreed artifact locations.
  3. Summarize what moved and what did not.
- Done When:
  - promotion review has actual benchmark evidence to cite

### CARD-M5-002 Host Smoke Rerun And Delta Capture

- Backlog Source: `VNEXT-M5-002`
- Size: `S`
- Validation Profile: `D`
- Depends On: `CARD-M1-006`, `CARD-M4-006`
- Read First:
  - host smoke matrix
  - any known host delta notes
- Write Scope:
  - `personal-skill-system/docs/`
  - optional benchmark host-run artifacts
- Deliverables:
  - host smoke rerun record
  - updated host compatibility delta note
- Steps:
  1. Re-execute the shared host smoke matrix.
  2. Record regressions and intentional deltas.
  3. Separate host defects from bundle defects.
- Done When:
  - host consistency claims have current evidence

### CARD-M5-003 Governance Pass And Refresh Checklist

- Backlog Source: `VNEXT-M5-003`
- Size: `S`
- Validation Profile: `R`
- Depends On: `CARD-M5-001`, `CARD-M5-002`
- Read First:
  - `skills/tools/verify-skill-system/SKILL.md`
  - latest registry and ratings artifacts
- Write Scope:
  - `personal-skill-system/docs/`
  - `personal-skill-system/registry/`
  - any stale or drifted metadata touched during the pass
- Deliverables:
  - promotion-time governance checklist result
- Steps:
  1. Rerun `verify-skill-system`.
  2. Confirm route regression artifacts, benchmark artifacts, and host-smoke artifacts exist.
  3. Fix any final metadata drift before memo writing.
- Done When:
  - promotion review is not blocked by governance drift

### CARD-M5-004 Promotion Decision Memo

- Backlog Source: `VNEXT-M5-004`
- Size: `S`
- Validation Profile: `D`
- Depends On: `CARD-M5-003`
- Read First:
  - benchmark rerun results
  - host smoke rerun results
  - governance pass result
- Write Scope:
  - `personal-skill-system/docs/`
- Deliverables:
  - `docs/VNEXT_PROMOTION_DECISION_2026-04-22.md`
- Steps:
  1. Summarize what improved.
  2. Summarize what is now proven.
  3. Summarize what remains weak and what stays experimental.
  4. Make the promotion call explicit.
- Done When:
  - maintainers have a final evidence-backed promotion decision record

## 7. Pull Rules

- Do not pull more than one `L` card at once.
- Do not run cards from different waves in parallel unless dependencies are already cleared.
- If a card touches `route-map.generated.json`, `route-fixtures.generated.json`, or shared tool libraries, treat it as exclusive ownership for that pass.
- After any routing, registry, or tool card, rerun the declared validation profile before closing the card.

## 8. Definition Of A Good Codex Card

A card in this deck is good only if all are true:

- Codex can tell what files it may touch
- Codex can tell what it must read first
- Codex can tell what command proves completion
- Codex can stop when the declared completion condition is met

If a future maintainer cannot execute a card without extra interpretation, the deck still has debt.
