# DOMAIN THICKNESS GAP AUDIT (2026-04-22)

Scope: `personal-skill-system/`
Card: `CARD-M0-004`
Depends on:

- `docs/BASELINE_SNAPSHOT_2026-04-22.md`
- `docs/EXPERT_REFERENCE_CLASSIFICATION_2026-04-22.md`

## 1) Audit Method

This audit covers the vNext priority domains:

- `development`
- `security`
- `devops`
- `data-engineering`
- `infrastructure`

Gap tags:

- `routing`: route-selection or route-boundary weakness
- `depth`: missing or thin judgement-task coverage
- `tool`: deterministic proof/tooling weakness
- `host`: cross-host runtime/portability weakness

Ranking rubric:

- Severity: `critical=3`, `high=2`, `medium=1`
- Frequency: `high=3`, `medium=2`, `low=1`
- Priority score: `severity * frequency` (higher first)

Baseline evidence used:

- route quality is still heuristic-first (`PERSONAL_SKILL_SYSTEM_VNEXT_TOP_LEVEL_ROADMAP_2026-04-22.md` W2)
- proof tools are still heuristic-heavy (`...ROADMAP...` W4)
- host smoke matrix is not yet landed (`...ROADMAP...` W5)
- per-domain reference classification and debt ratios (`EXPERT_REFERENCE_CLASSIFICATION_2026-04-22.md`)

## 2) Domain Gap Lists

### Development

Context evidence:

- coverage: `real-depth 9/15`, `index 4`, `legacy-split 2` (debt ratio `40%`)

Gaps:

- `DEV-G01` | `depth` | severity `critical` | frequency `high` | score `9` | Missing judgement tasks for `typescript`, `go`, `java`, `rust` (first-class expert depth absent).
- `DEV-G02` | `depth` | severity `high` | frequency `high` | score `6` | Performance decision path is still index-shaped (`expert-performance-optimization.md`) instead of standalone deep module.
- `DEV-G03` | `depth` | severity `high` | frequency `medium` | score `4` | Test design/refactor safety/runtime failure handling still relies on thin transitional references (`code-implementation-and-refactoring.md`, `debugging-and-test-strategy.md`).
- `DEV-G04` | `routing` | severity `high` | frequency `medium` | score `4` | Language-specific intents are not explicitly route-distinguished; hybrid candidate reasoning is pending.
- `DEV-G05` | `tool` | severity `high` | frequency `medium` | score `4` | `verify-quality` still lacks stronger AST-backed boundary checks needed for development-heavy refactor/regression proofs.

### Security

Context evidence:

- coverage: `real-depth 4/10`, `index 0`, `legacy-split 6` (debt ratio `60%`)

Gaps:

- `SEC-G01` | `depth` | severity `critical` | frequency `high` | score `9` | Supply-chain and dependency trust judgement depth is missing.
- `SEC-G02` | `depth` | severity `critical` | frequency `high` | score `9` | Cloud/workload identity security depth is missing as a dedicated judgement surface.
- `SEC-G03` | `depth` | severity `high` | frequency `high` | score `6` | CI/CD and release-boundary abuse cases are not covered as deep task-shaped modules.
- `SEC-G04` | `depth` | severity `high` | frequency `high` | score `6` | Exploit-path severity framing remains too generic in transitional references.
- `SEC-G05` | `tool` | severity `critical` | frequency `high` | score `9` | `verify-security` still needs AST + taint-lite improvements for JS/TS/Python sinks.
- `SEC-G06` | `host` | severity `medium` | frequency `medium` | score `2` | Security execution consistency across `codex/claude/gemini` is unproven until host smoke matrix exists.

### DevOps

Context evidence:

- coverage: `real-depth 4/9`, `index 0`, `legacy-split 5` (debt ratio `55.6%`)

Gaps:

- `DOP-G01` | `depth` | severity `high` | frequency `high` | score `6` | Progressive delivery and canary judgement depth is insufficient.
- `DOP-G02` | `depth` | severity `high` | frequency `medium` | score `4` | Rollback math and exposure-window decision rules are still thin.
- `DOP-G03` | `depth` | severity `high` | frequency `medium` | score `4` | Failure-mode runbook patterns are incomplete as decision modules.
- `DOP-G04` | `routing` | severity `medium` | frequency `high` | score `3` | Ambiguous prompts between `devops` and adjacent operational domains still rely on heuristic routing.
- `DOP-G05` | `tool` | severity `high` | frequency `medium` | score `4` | Guard consumption of structured risk classes is not yet complete (`strict/balanced/advisory` tiers pending).
- `DOP-G06` | `host` | severity `medium` | frequency `medium` | score `2` | Multi-host operational behavior (auto-chain + tool invocation) lacks shared smoke evidence.

### Data Engineering

Context evidence:

- coverage: `real-depth 4/8`, `index 1`, `legacy-split 3` (debt ratio `50%`)

Gaps:

- `DAT-G01` | `depth` | severity `high` | frequency `high` | score `6` | Replay, late-data, idempotency, backfill, and reconciliation operations need deeper task-shaped judgement coverage.
- `DAT-G02` | `depth` | severity `high` | frequency `medium` | score `4` | Warehouse cost/performance decision surfaces are missing.
- `DAT-G03` | `depth` | severity `medium` | frequency `high` | score `3` | Index-only `expert-operating-principles.md` inflates depth claims and hides missing concrete modules.
- `DAT-G04` | `routing` | severity `medium` | frequency `medium` | score `2` | Ambiguous prompts spanning data platform vs infrastructure/architecture lack robust candidate reasoning.
- `DAT-G05` | `tool` | severity `medium` | frequency `medium` | score `2` | Validator output lacks domain-oriented signals for data contract blast radius.
- `DAT-G06` | `host` | severity `medium` | frequency `medium` | score `2` | Data engineering route/tool behavior has no cross-host smoke confirmation.

### Infrastructure

Context evidence:

- coverage: `real-depth 6/13`, `index 0`, `legacy-split 7` (debt ratio `53.8%`)

Gaps:

- `INF-G01` | `depth` | severity `high` | frequency `high` | score `6` | Multi-environment policy depth is still spread across transitional references.
- `INF-G02` | `depth` | severity `high` | frequency `high` | score `6` | Secret plane and workload identity migration judgement remains thin.
- `INF-G03` | `depth` | severity `high` | frequency `medium` | score `4` | Tenancy migration playbooks (boundary shifts and rollback posture) are missing as deep modules.
- `INF-G04` | `depth` | severity `high` | frequency `medium` | score `4` | DR drill realism and recovery-evidence loops are not consistently captured as task outputs.
- `INF-G05` | `routing` | severity `medium` | frequency `high` | score `3` | `infrastructure` vs `devops` mixed prompts remain susceptible to heuristic false positives.
- `INF-G06` | `tool` | severity `high` | frequency `medium` | score `4` | Structured config blast-radius and rollback posture summaries are still limited in proof tooling.
- `INF-G07` | `host` | severity `medium` | frequency `medium` | score `2` | Host portability for infrastructure-heavy tasks is not yet verified by smoke matrix.

## 3) Ranked Cross-Domain Priority Queue

Top gaps by score (for immediate planning):

1. `DEV-G01` (9)
2. `SEC-G01` (9)
3. `SEC-G02` (9)
4. `SEC-G05` (9)
5. `DEV-G02` (6)
6. `SEC-G03` (6)
7. `SEC-G04` (6)
8. `DOP-G01` (6)
9. `DAT-G01` (6)
10. `INF-G01` (6)
11. `INF-G02` (6)
12. next tier: all score-4 gaps (`DEV-G03/04/05`, `DOP-G02/03/05`, `DAT-G02`, `INF-G03/04/06`)

## 4) Mapping To Existing M3 Cards

- `CARD-M3-001` / `CARD-M3-002` / `CARD-M3-003` (Development): `DEV-G01..DEV-G05`
- `CARD-M3-004` / `CARD-M3-005` / `CARD-M3-006` (Security): `SEC-G01..SEC-G06`
- `CARD-M3-007` (DevOps): `DOP-G01..DOP-G06`
- `CARD-M3-008` (Data Engineering): `DAT-G01..DAT-G06`
- `CARD-M3-009` (Infrastructure): `INF-G01..INF-G07`

This mapping lets M3 implementation cards consume named gaps directly instead of re-discovering scope.

## 5) Exit Check Against CARD-M0-004

- each priority domain has a named gap list: `pass`
- every listed gap is tagged as `routing`, `depth`, `tool`, or `host`: `pass`
- severity + frequency ranking is explicit: `pass`
- M3 cards can reference this audit directly: `pass`
