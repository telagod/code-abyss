# PERSONAL_SKILL_SYSTEM Top-Tier Execution Plan (2026-04-23)

Scope: `personal-skill-system/` and the repo-level distribution surface.

Source assessments:

- `docs/glm-5.1-project-diagnosis.md` actually exists at `personal-skill-system/docs/glm-5.1-project-diagnosis.md`.
- `docs/PERSONAL_SKILL_SYSTEM_VNEXT_TOP_LEVEL_ROADMAP_2026-04-22.md`
- `docs/BASELINE_SNAPSHOT_2026-04-22.md`
- `docs/DOMAIN_THICKNESS_GAP_AUDIT_2026-04-22.md`
- `docs/CAPABILITY_MODULE_RATINGS.md`
- `docs/SKILL_TOP_LEVEL_AUDIT_2026-04-20.md`

Current decision records:

- `docs/SKILL_SOURCE_OF_TRUTH_DECISION_2026-04-23.md`
- `docs/TOP_DEVELOPER_PROMOTION_DECISION_2026-04-23.md`
- `docs/LOCAL_CI_SMOKE_POLICY_2026-04-23.md`
- `docs/MULTI_MODEL_EVALUATION_PROTOCOL_2026-04-23.md`
- `docs/archive/RECORDS_ARCHIVE_INDEX_2026-04-23.md`

## 1. Verdict

GLM's core diagnosis is directionally correct for the repo-level distributed product:

- root `skills/` contains `21` `SKILL.md` files.
- `personal-skill-system/skills/` contains `33` `SKILL.md` files and is the stronger system.
- `top_developer/` contains `8` skills but is not part of the current npm `files` list.
- `package.json` still distributes root `skills/`, not the full `personal-skill-system` tree.
- `packs/abyss/manifest.json` has `claude` and `codex` host entries but no `gemini` entry.
- `install.js` is still a large orchestration file and mixes CLI, install core, command generation, host branching, and process exits.

GLM's conclusion needs one correction:

- The project does have a stronger 33-skill system, but it is located under `personal-skill-system/`; the distribution path has not been unified with it.

Internal audits add a stricter caveat:

- Under the current `weak-model-uplift` frame, the 33-skill bundle is rated top-level.
- Under an absolute top-tier standard, it is not proven yet because routing, benchmark evidence, proof tooling, and host smoke evidence remain incomplete.

## 2. Top-Tier Standard

Do not claim "all skills are top-tier in their domains" until all gates below pass:

| Gate | Required Evidence |
|---|---|
| Source gate | One authoritative skill source feeds distribution, registry, route-map, docs, and tests. |
| Schema gate | Every shipped skill uses schema-v2 metadata with kind, runtime, route, host, risk, owner, review, and chaining fields. |
| Route gate | Hybrid routing reports candidates, confidence, reason, boundary, fallback, and regression results. |
| Depth gate | Priority domains no longer rely on index-only or legacy-split files as depth evidence. |
| Tool gate | Security, quality, change, and guard tools provide stronger-than-regex proof for high-risk paths. |
| Benchmark gate | Maintained gold tasks prove base vs base+skills uplift across priority domains. |
| Host gate | Codex, Claude, and Gemini pass the shared host smoke matrix or have documented soft-fail deltas. |
| Distribution gate | npm package, pack manifests, install smoke, docs, and generated metadata describe the same shipped system. |

## 3. Execution Rules

Use these rules when pulling any card:

| Rule | Requirement |
|---|---|
| Single write surface | One card owns one narrow directory or file family. |
| No epic cards | A card is too large if it combines source migration, generator changes, docs, and tests. |
| Read before edit | Read the listed source files before touching output files. |
| Generated artifacts | If a card changes metadata source, regenerate and validate generated artifacts in the same card. |
| Evidence first | Every card must leave a command result, fixture, benchmark record, or doc note. |
| No silent route drift | Any route change requires fixture updates and route regression. |
| No fake depth | Navigation/index files cannot count as expert depth. |
| Host deltas explicit | Host-specific behavior must be documented, not hidden in adapters. |

Validation profiles:

| Profile | Command |
|---|---|
| `D` | `node personal-skill-system/skills/tools/verify-skill-system/scripts/run.js --target personal-skill-system --json` |
| `R` | `node personal-skill-system/skills/tools/verify-skill-system/scripts/run.js --target personal-skill-system --json` and `npm test -- test/personal_skill_system_tools.test.js --runInBand` |
| `P` | `npm run verify:skills` plus targeted install or pack tests after distribution changes |
| `T` | `npm test -- test/personal_skill_system_tools.test.js --runInBand` plus the changed tool's fixture test |
| `B` | benchmark runner plus summary artifact update |
| `H` | shared host smoke matrix run plus host delta artifact |

## 4. Single-Level Task Cards

Each card below is a smallest practical construction unit.

### P0. Source And Distribution Alignment

| Card | Goal | Write Scope | Validation | Done Signal |
|---|---|---|---|---|
| `CARD-P0-001` | Record the authoritative skill source decision. | `personal-skill-system/docs/` | `D` | A doc states whether root `skills/` is generated from `personal-skill-system/skills` or replaced by it. |
| `CARD-P0-002` | Inventory root `skills/` vs `personal-skill-system/skills`. | `personal-skill-system/docs/` | `D` | A count table lists missing, extra, and path-mismatched skills. |
| `CARD-P0-003` | Inventory `top_developer/` distribution status. | `personal-skill-system/docs/` | `D` | A decision note says whether `top_developer` is bundled, linked, or intentionally external. |
| `CARD-P0-004` | Define source-to-package mapping. | `package.json`, `personal-skill-system/docs/` | `P` | `files` policy maps the intended skill source to npm package contents. |
| `CARD-P0-005` | Add root distribution completeness check. | `bin/`, `test/` | `P` | Verification fails if distributed skill count diverges from the chosen source. |
| `CARD-P0-006` | Add `verify:skill-system` npm script. | `package.json` | `P` | `npm run verify:skill-system` validates the chosen skill system. |
| `CARD-P0-007` | Backfill `workflows/bugfix`. | `skills/workflows/bugfix/` or chosen source mirror | `D` | The workflow exists with schema-v2 metadata and references. |
| `CARD-P0-008` | Backfill `workflows/investigate`. | `skills/workflows/investigate/` or chosen source mirror | `D` | The workflow exists with schema-v2 metadata and references. |
| `CARD-P0-009` | Backfill `workflows/review`. | `skills/workflows/review/` or chosen source mirror | `D` | The workflow exists with schema-v2 metadata and references. |
| `CARD-P0-010` | Backfill `workflows/ship`. | `skills/workflows/ship/` or chosen source mirror | `D` | The workflow exists with schema-v2 metadata and references. |
| `CARD-P0-011` | Backfill `workflows/architecture-decision`. | `skills/workflows/architecture-decision/` or chosen source mirror | `D` | The workflow exists with schema-v2 metadata and references. |
| `CARD-P0-012` | Backfill `workflows/skill-evolution`. | `skills/workflows/skill-evolution/` or chosen source mirror | `D` | The workflow exists and routes self-system evolution requests. |
| `CARD-P0-013` | Backfill `workflows/multi-agent`. | `skills/workflows/multi-agent/` or chosen source mirror | `D` | The workflow path replaces the old orchestration-only path or documents the alias. |
| `CARD-P0-014` | Backfill `guards/pre-commit-gate`. | `skills/guards/pre-commit-gate/` or chosen source mirror | `T` | Guard has metadata, references, script entry, and fixture coverage. |
| `CARD-P0-015` | Backfill `guards/pre-merge-gate`. | `skills/guards/pre-merge-gate/` or chosen source mirror | `T` | Guard has metadata, references, script entry, and fixture coverage. |
| `CARD-P0-016` | Backfill `routers/sage`. | `skills/routers/sage/` or chosen source mirror | `R` | Router has route policy, skill catalog, metadata, and fixtures. |
| `CARD-P0-017` | Backfill `tools/verify-skill-system`. | `skills/tools/verify-skill-system/` or chosen source mirror | `T` | Tool can audit the shipped skill system. |
| `CARD-P0-018` | Backfill `domains/chart-visualization`. | `skills/domains/chart-visualization/` or chosen source mirror | `R` | Domain is routeable and has expert references. |
| `CARD-P0-019` | Backfill `tools/verify-chart-spec`. | `skills/tools/verify-chart-spec/` or chosen source mirror | `T` | Tool catches invalid chart spec fixtures. |
| `CARD-P0-020` | Backfill `tools/verify-s2-config`. | `skills/tools/verify-s2-config/` or chosen source mirror | `T` | Tool catches invalid S2 config fixtures. |
| `CARD-P0-021` | Move frontend variants to canonical path. | `skills/domains/frontend-design/variants/` or chosen source mirror | `R` | claymorphism, glassmorphism, liquid-glass, neubrutalism paths match registry. |
| `CARD-P0-022` | Fix multi-agent canonical route path. | `skills/workflows/multi-agent/`, registry | `R` | Registry route points to the workflow path. |
| `CARD-P0-023` | Add Gemini to abyss manifest. | `packs/abyss/manifest.json`, tests | `P` | Manifest hosts include `gemini` and pack tests pass. |
| `CARD-P0-024` | Fix stale package description. | `package.json` | `P` | Description no longer claims stale `56` count. |
| `CARD-P0-025` | Update root README skill count and source policy. | `README.md` | `P` | README matches actual distribution and source-of-truth decision. |

### P1. Schema And Registry Automation

| Card | Goal | Write Scope | Validation | Done Signal |
|---|---|---|---|---|
| `CARD-P1-001` | Define schema-v2 required field set. | `personal-skill-system/docs/`, schema files | `D` | Field list is documented and machine-checkable. |
| `CARD-P1-002` | Upgrade one router skill to schema-v2. | `skills/routers/sage/SKILL.md` or chosen source | `R` | Router passes schema validation. |
| `CARD-P1-003` | Upgrade one domain skill to schema-v2. | One domain `SKILL.md` | `D` | Domain passes schema validation. |
| `CARD-P1-004` | Upgrade one workflow skill to schema-v2. | One workflow `SKILL.md` | `D` | Workflow passes schema validation. |
| `CARD-P1-005` | Upgrade one tool skill to schema-v2. | One tool `SKILL.md` | `T` | Tool passes schema validation and runtime smoke. |
| `CARD-P1-006` | Upgrade one guard skill to schema-v2. | One guard `SKILL.md` | `T` | Guard passes schema validation and runtime smoke. |
| `CARD-P1-007` | Batch-upgrade remaining domain metadata. | Domain `SKILL.md` files only | `D` | All domains pass schema validation. |
| `CARD-P1-008` | Batch-upgrade remaining workflow metadata. | Workflow `SKILL.md` files only | `D` | All workflows pass schema validation. |
| `CARD-P1-009` | Batch-upgrade remaining tool metadata. | Tool `SKILL.md` files only | `T` | All tools pass schema validation. |
| `CARD-P1-010` | Batch-upgrade remaining guard metadata. | Guard `SKILL.md` files only | `T` | All guards pass schema validation. |
| `CARD-P1-011` | Generate registry from frontmatter. | `personal-skill-system/scripts/`, `registry/` | `R` | Registry generated from skill metadata without manual edits. |
| `CARD-P1-012` | Generate route-map from frontmatter. | `personal-skill-system/scripts/`, `registry/` | `R` | Route-map generated from activation metadata. |
| `CARD-P1-013` | Generate capability rating cross-check. | `personal-skill-system/scripts/`, `registry/` | `D` | Capability ratings align with registry module groups. |
| `CARD-P1-014` | Add drift test for generated metadata. | `test/`, `personal-skill-system/` | `R` | Test fails when generated metadata is stale. |
| `CARD-P1-015` | Document generation workflow. | `personal-skill-system/docs/` | `D` | Maintainer can regenerate registry and route-map from commands. |

### P2. Installer And Package Refactor

| Card | Goal | Write Scope | Validation | Done Signal |
|---|---|---|---|---|
| `CARD-P2-001` | Extract install core from `install.js`. | `bin/lib/installer-core.js`, `bin/install.js` | `P` | CLI delegates install core without behavior change. |
| `CARD-P2-002` | Extract uninstall core. | `bin/lib/uninstaller-core.js`, uninstall callers | `P` | Install and uninstall share manifest semantics. |
| `CARD-P2-003` | Extract command spec model. | `bin/lib/command-spec.js` | `P` | Claude and Gemini command generation consume the same spec. |
| `CARD-P2-004` | Extract Claude command renderer. | `bin/lib/command-render-claude.js` | `P` | Claude command tests still pass. |
| `CARD-P2-005` | Extract Gemini command renderer. | `bin/lib/command-render-gemini.js` | `P` | Gemini command tests still pass. |
| `CARD-P2-006` | Extract pack install loop. | `bin/lib/pack-installer.js` | `P` | Pack install logic is not duplicated across host branches. |
| `CARD-P2-007` | Replace library `process.exit` with return codes. | `bin/install.js`, extracted libs | `P` | Core functions are unit-testable without exiting. |
| `CARD-P2-008` | Rename shared gstack codex module. | `bin/lib/gstack-codex.js`, imports, tests | `P` | Shared module name no longer implies Codex-only behavior. |
| `CARD-P2-009` | Remove module-level cache test pollution risk. | `bin/lib/style-registry.js`, tests | `P` | Cache reset or pure loading path exists. |
| `CARD-P2-010` | Add pack-docs unit tests. | `test/`, `bin/lib/pack-docs.js` | `P` | Marker insertion and idempotence are covered. |
| `CARD-P2-011` | Add packs CLI edge tests. | `test/packs-cli.test.js` | `P` | Unknown args, missing subjects, and JSON output are covered. |
| `CARD-P2-012` | Add vendor provider registry tests. | `test/vendor-provider-registry.test.js` | `P` | Provider lookup, unknown provider, and error surfaces are covered. |

### P3. Benchmark And Evaluation Evidence

| Card | Goal | Write Scope | Validation | Done Signal |
|---|---|---|---|---|
| `CARD-P3-001` | Define benchmark run schema. | `personal-skill-system/benchmark/`, docs | `B` | A run can record model, host, prompt, route, score, and failure class. |
| `CARD-P3-002` | Add architecture gold tasks. | `personal-skill-system/benchmark/tasks/architecture/` | `B` | At least 10 architecture tasks exist. |
| `CARD-P3-003` | Add development gold tasks. | `personal-skill-system/benchmark/tasks/development/` | `B` | At least 10 development tasks exist. |
| `CARD-P3-004` | Add review gold tasks. | `personal-skill-system/benchmark/tasks/review/` | `B` | At least 10 review tasks exist. |
| `CARD-P3-005` | Add security gold tasks. | `personal-skill-system/benchmark/tasks/security/` | `B` | At least 10 security tasks exist. |
| `CARD-P3-006` | Add AI gold tasks. | `personal-skill-system/benchmark/tasks/ai/` | `B` | At least 10 AI tasks exist. |
| `CARD-P3-007` | Add chart gold tasks. | `personal-skill-system/benchmark/tasks/chart-visualization/` | `B` | At least 10 chart tasks exist. |
| `CARD-P3-008` | Add orchestration gold tasks. | `personal-skill-system/benchmark/tasks/orchestration/` | `B` | At least 10 orchestration tasks exist. |
| `CARD-P3-009` | Add route correctness rubric. | `personal-skill-system/benchmark/rubrics/` | `B` | Rubric scores selected skill and fallback behavior. |
| `CARD-P3-010` | Add reasoning quality rubric. | `personal-skill-system/benchmark/rubrics/` | `B` | Rubric scores decomposition, tradeoffs, and assumptions. |
| `CARD-P3-011` | Add validation quality rubric. | `personal-skill-system/benchmark/rubrics/` | `B` | Rubric scores evidence, commands, and residual risk. |
| `CARD-P3-012` | Add final correctness rubric. | `personal-skill-system/benchmark/rubrics/` | `B` | Rubric scores task completion outcome. |
| `CARD-P3-013` | Add benchmark runner stub. | `personal-skill-system/benchmark/` | `B` | Runner validates tasks and emits empty summary. |
| `CARD-P3-014` | Add GLM run import format. | `personal-skill-system/benchmark/runs/` | `B` | GLM diagnosis can be represented as a run artifact. |
| `CARD-P3-015` | Add GPT-5.4 review run slot. | `personal-skill-system/benchmark/runs/` | `B` | Independent GPT-5.4 results can be stored without changing schema. |
| `CARD-P3-016` | Add Claude review run slot. | `personal-skill-system/benchmark/runs/` | `B` | Independent Claude results can be stored without changing schema. |
| `CARD-P3-017` | Add Gemini review run slot. | `personal-skill-system/benchmark/runs/` | `B` | Independent Gemini results can be stored without changing schema. |
| `CARD-P3-018` | Generate benchmark summary. | `personal-skill-system/benchmark/summary.generated.json` | `B` | Summary aggregates scores and failure classes. |

### P4. Routing Upgrade

| Card | Goal | Write Scope | Validation | Done Signal |
|---|---|---|---|---|
| `CARD-P4-001` | Add route boundary notes field. | route schema and generated route-map | `R` | Each route can explain what it does not own. |
| `CARD-P4-002` | Add route confidence thresholds. | route schema and generated route-map | `R` | Route entries carry minimum, strong, and very-strong thresholds. |
| `CARD-P4-003` | Add route rationale field. | route schema and generated route-map | `R` | Route decisions can expose a short reason. |
| `CARD-P4-004` | Add explicit invocation precedence tests. | route fixtures and tests | `R` | Explicit skill invocation beats fuzzy routing. |
| `CARD-P4-005` | Add ambiguous prompt fallback fixtures. | route fixtures | `R` | Ambiguous prompts trigger one-question fallback. |
| `CARD-P4-006` | Add security-vs-architecture conflict fixtures. | route fixtures | `R` | Security intent wins when exploit or trust-boundary terms dominate. |
| `CARD-P4-007` | Add infrastructure-vs-devops conflict fixtures. | route fixtures | `R` | Platform topology and release operations route differently. |
| `CARD-P4-008` | Add development language route fixtures. | route fixtures | `R` | TS, Go, Java, Rust, Python prompts route with language evidence. |
| `CARD-P4-009` | Implement candidate list reporting. | `skills/tools/lib/skill-system-routing.js` | `R` | Route engine returns ranked candidates. |
| `CARD-P4-010` | Implement semantic rerank hook. | routing library | `R` | Rerank interface exists and has deterministic fallback. |
| `CARD-P4-011` | Implement fallback reason reporting. | routing library | `R` | Low-confidence outputs say why no auto-route occurred. |
| `CARD-P4-012` | Generate route regression report. | `personal-skill-system/registry/` or benchmark runs | `R` | Route precision and failure classes are recorded. |

### P5. Domain Depth Equalization

| Card | Goal | Write Scope | Validation | Done Signal |
|---|---|---|---|---|
| `CARD-P5-001` | Add TypeScript expert module. | `skills/domains/development/references/` | `D` | Module covers type boundaries, async, build, runtime, and test traps. |
| `CARD-P5-002` | Add Go expert module. | `skills/domains/development/references/` | `D` | Module covers concurrency, interfaces, errors, context, and profiling. |
| `CARD-P5-003` | Add Java expert module. | `skills/domains/development/references/` | `D` | Module covers JVM, concurrency, Spring, transactions, and observability. |
| `CARD-P5-004` | Add Rust expert module. | `skills/domains/development/references/` | `D` | Module covers ownership, async, error models, FFI, and perf. |
| `CARD-P5-005` | Split development performance module. | `skills/domains/development/references/` | `D` | Performance is standalone depth, not an index-only pointer. |
| `CARD-P5-006` | Deepen test design module. | `skills/domains/development/references/` | `D` | Unit, integration, E2E, fixtures, and regression proof are covered. |
| `CARD-P5-007` | Deepen refactor safety module. | `skills/domains/development/references/` | `D` | API contracts, migrations, flags, and rollback are covered. |
| `CARD-P5-008` | Add supply-chain security module. | `skills/domains/security/references/` | `D` | Dependencies, lockfiles, provenance, scripts, and vendoring are covered. |
| `CARD-P5-009` | Add workload identity security module. | `skills/domains/security/references/` | `D` | IAM, tokens, cloud identities, and secretless patterns are covered. |
| `CARD-P5-010` | Add CI/CD abuse module. | `skills/domains/security/references/` | `D` | Pipeline permissions, artifacts, release gates, and runner trust are covered. |
| `CARD-P5-011` | Add exploit severity framing module. | `skills/domains/security/references/` | `D` | Exploitability, blast radius, compensating controls, and evidence are covered. |
| `CARD-P5-012` | Deepen progressive delivery module. | `skills/domains/devops/references/` | `D` | Canary, phased rollout, SLO gates, and abort criteria are covered. |
| `CARD-P5-013` | Deepen rollback math module. | `skills/domains/devops/references/` | `D` | Exposure windows, data compatibility, and rollback cost are covered. |
| `CARD-P5-014` | Deepen failure-mode runbook module. | `skills/domains/devops/references/` | `D` | Runbooks start from failure classes and reduce diagnosis time. |
| `CARD-P5-015` | Deepen replay and backfill module. | `skills/domains/data-engineering/references/` | `D` | Replay, idempotency, late data, and reconciliation are covered. |
| `CARD-P5-016` | Add warehouse cost-performance module. | `skills/domains/data-engineering/references/` | `D` | Partitioning, clustering, materialization, and query cost are covered. |
| `CARD-P5-017` | Deepen multi-environment policy module. | `skills/domains/infrastructure/references/` | `D` | Dev/stage/prod policy, drift, and promotion boundaries are covered. |
| `CARD-P5-018` | Deepen secret plane migration module. | `skills/domains/infrastructure/references/` | `D` | Secret ownership, rotation, identity migration, and rollback are covered. |
| `CARD-P5-019` | Deepen tenancy migration module. | `skills/domains/infrastructure/references/` | `D` | Tenant boundary shifts, isolation, migration, and reversibility are covered. |
| `CARD-P5-020` | Deepen DR drill realism module. | `skills/domains/infrastructure/references/` | `D` | RTO/RPO, evidence, game days, and recovery proof are covered. |
| `CARD-P5-021` | Reclassify index-only references. | classification docs and registry metadata | `D` | Index files are not counted as top-tier depth. |
| `CARD-P5-022` | Sync capability ratings after depth changes. | `registry/`, docs | `D` | Ratings match real-depth modules. |
| `CARD-P5-023` | Run domain benchmark delta pass. | `benchmark/runs/` | `B` | Depth changes show measured uplift or named failure. |

### P6. Proof Tool Upgrade

| Card | Goal | Write Scope | Validation | Done Signal |
|---|---|---|---|---|
| `CARD-P6-001` | Define verify-security result model. | `skills/tools/verify-security/`, shared libs | `T` | Findings include sink, source, confidence, scope, and severity. |
| `CARD-P6-002` | Add JS/TS AST extraction for security sinks. | `skills/tools/verify-security/` | `T` | JS/TS sink fixtures pass. |
| `CARD-P6-003` | Add Python AST extraction for security sinks. | `skills/tools/verify-security/` | `T` | Python sink fixtures pass. |
| `CARD-P6-004` | Add source-to-sink grouping. | `skills/tools/verify-security/` | `T` | Taint-lite grouping appears in JSON output. |
| `CARD-P6-005` | Suppress docs and test fixture false positives. | `skills/tools/verify-security/` | `T` | Fixture noise decreases without hiding real code findings. |
| `CARD-P6-006` | Define verify-quality result model. | `skills/tools/verify-quality/` | `T` | Findings include rule id, location, category, and remediation. |
| `CARD-P6-007` | Add JS/TS AST function extraction. | `skills/tools/verify-quality/` | `T` | Function length and complexity checks use AST where available. |
| `CARD-P6-008` | Add async misuse quality checks. | `skills/tools/verify-quality/` | `T` | Unawaited promise and unsafe async patterns are covered. |
| `CARD-P6-009` | Add boundary-contract quality checks. | `skills/tools/verify-quality/` | `T` | Public API and config contract smells are covered. |
| `CARD-P6-010` | Define verify-change structured risk classes. | `skills/tools/verify-change/` | `T` | Output includes API, config, data, security, rollback classes. |
| `CARD-P6-011` | Add API surface change detection. | `skills/tools/verify-change/` | `T` | Export, command, and schema changes are reported. |
| `CARD-P6-012` | Add rollback posture summary. | `skills/tools/verify-change/` | `T` | Output says whether rollback is simple, risky, or blocked. |
| `CARD-P6-013` | Add guard policy tier config. | `skills/guards/` | `T` | Guards support strict, balanced, and advisory tiers. |
| `CARD-P6-014` | Make guards consume structured risk. | `skills/guards/` | `T` | Guards block on risk classes, not raw warning counts. |
| `CARD-P6-015` | Add validator regression fixture pack. | `test/`, `personal-skill-system/fixtures/` | `T` | False positive and true positive fixtures are versioned. |

### P7. Host Runtime And Promotion

| Card | Goal | Write Scope | Validation | Done Signal |
|---|---|---|---|---|
| `CARD-P7-001` | Implement Codex host smoke runner. | `benchmark/host-smoke/` | `H` | Codex smoke results can be recorded. |
| `CARD-P7-002` | Implement Claude host smoke runner. | `benchmark/host-smoke/` | `H` | Claude smoke results can be recorded. |
| `CARD-P7-003` | Implement Gemini host smoke runner. | `benchmark/host-smoke/` | `H` | Gemini smoke results can be recorded. |
| `CARD-P7-004` | Record current host deltas. | `personal-skill-system/docs/` | `H` | Known host differences are documented. |
| `CARD-P7-005` | Add pack promotion checklist. | `personal-skill-system/docs/` | `D` | Experimental-to-core promotion has required gates. |
| `CARD-P7-006` | Add governance refresh checklist. | `personal-skill-system/docs/` | `D` | Structural changes have source, generated, validation, and docs checks. |
| `CARD-P7-007` | Rerun full benchmark. | `benchmark/runs/` | `B` | Summary proves or rejects top-tier claim. |
| `CARD-P7-008` | Rerun host smoke matrix. | `benchmark/host-smoke/runs/` | `H` | Each host has pass, soft-fail, or fail status. |
| `CARD-P7-009` | Write promotion decision memo. | `personal-skill-system/docs/` | `D` | Memo states promoted, experimental, proven, and still weak areas. |

## 5. Model Choice

Use Codex for implementation.

Reason:

- This work is repository-bound.
- It needs file edits, generated artifacts, local tests, path checks, and incremental validation.
- Codex has the workspace, shell, patching, and validation loop required for safe execution.

Use GPT-5.4 as an independent reviewer or planning model.

Best use cases:

- adversarial review of task cards
- benchmark rubric critique
- route boundary critique
- domain-depth critique
- promotion decision review

Practical operating mode:

| Phase | Best Tool |
|---|---|
| Edit files, run tests, generate registry, fix install pipeline | Codex |
| Judge whether a skill is genuinely top-tier | GPT-5.4 review pass |
| Produce or critique benchmark rubrics | GPT-5.4 review pass |
| Execute card-by-card implementation | Codex |
| Final release/promotion memo | Codex draft plus GPT-5.4 adversarial review |

## 6. Future Skill Integration Protocol

Use this protocol whenever adding an outside skill or skill pack.

| Step | Action | Output |
|---|---|---|
| `INT-001` | Classify the incoming skill as `domain`, `workflow`, `tool`, `guard`, `router`, or `variant`. | Integration decision note. |
| `INT-002` | Decide whether it belongs in core, experimental, project-overlay, or work-private pack. | Pack placement decision. |
| `INT-003` | Normalize the skill name to lowercase hyphen-case. | Stable folder name. |
| `INT-004` | Convert frontmatter to schema-v2. | Valid `SKILL.md`. |
| `INT-005` | Keep `SKILL.md` concise and move deep material into `references/`. | Progressive disclosure structure. |
| `INT-006` | Put deterministic repeated logic into `scripts/`. | Scripted runtime where needed. |
| `INT-007` | Put templates, icons, sample assets, and starter files into `assets/`. | Asset-backed workflow where needed. |
| `INT-008` | Add trigger keywords, negative keywords, aliases, conflicts, and auto-chain fields. | Route-ready metadata. |
| `INT-009` | Add route fixtures for explicit, implicit, mixed, and negative prompts. | Route regression coverage. |
| `INT-010` | Add tool fixtures if the skill has scripts. | Runtime regression coverage. |
| `INT-011` | Regenerate registry, route-map, and capability ratings. | Synchronized metadata. |
| `INT-012` | Run `verify-skill-system`. | Structural validation evidence. |
| `INT-013` | Run targeted tests for any changed routing or tool code. | Behavioral validation evidence. |
| `INT-014` | Add benchmark tasks if the skill claims domain expertise. | Uplift evidence path. |
| `INT-015` | Add host smoke coverage if the skill is user-invocable. | Codex/Claude/Gemini portability evidence. |
| `INT-016` | Document residual risk and promotion status. | Core, experimental, or rejected status. |

Integration rejection rules:

| Reject If | Reason |
|---|---|
| The skill is only generic advice | It does not materially uplift the model. |
| The skill bloats `SKILL.md` instead of using references | It harms context economy. |
| The skill has scripts without tests | Runtime behavior is not trustworthy. |
| The skill overlaps an existing route without conflicts or boundary notes | It creates routing ambiguity. |
| The skill cannot pass host smoke but claims portability | It creates false distribution claims. |
| The skill has no benchmark path but claims top-tier domain authority | The claim is unproven. |

## 7. Immediate Pull Order

Start here:

| Order | Card |
|---:|---|
| 1 | `CARD-P0-001` |
| 2 | `CARD-P0-002` |
| 3 | `CARD-P0-004` |
| 4 | `CARD-P0-005` |
| 5 | `CARD-P0-006` |
| 6 | `CARD-P0-016` |
| 7 | `CARD-P0-017` |
| 8 | `CARD-P0-023` |
| 9 | `CARD-P1-001` |
| 10 | `CARD-P3-001` |

Reason:

- first remove source-of-truth ambiguity
- then make self-verification part of npm scripts
- then close router and self-audit gaps
- then start proof infrastructure before claiming absolute top-tier
