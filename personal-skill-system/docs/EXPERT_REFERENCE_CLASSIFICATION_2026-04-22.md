# EXPERT REFERENCE CLASSIFICATION (2026-04-22)

Scope: `personal-skill-system/`
Card: `CARD-M0-003`
Depends on: `docs/EXPERT_REFERENCE_CLASSIFICATION_RULES_2026-04-22.md`

## 1) Method

Classification was applied to all references under the priority surfaces required by the card:

- `personal-skill-system/skills/domains/development/references`
- `personal-skill-system/skills/domains/security/references`
- `personal-skill-system/skills/domains/devops/references`
- `personal-skill-system/skills/domains/data-engineering/references`
- `personal-skill-system/skills/domains/infrastructure/references`
- `personal-skill-system/skills/domains/ai/references`
- `personal-skill-system/skills/workflows/review/references`

Rule application order (from M0-002 rules):

1. navigation-first files => `index`
2. module-backed deep references (present in `registry/registry.generated.json` `module-groups`) => `real-depth`
3. remaining references => `legacy-split` (transitional, thin, or superseded)

Evidence used:

- `personal-skill-system/docs/EXPERT_REFERENCE_CLASSIFICATION_RULES_2026-04-22.md`
- `personal-skill-system/registry/registry.generated.json`
- priority-domain reference files under `skills/domains/*/references` and `skills/workflows/review/references`

## 2) Summary

| Domain | Total | real-depth | index | legacy-split |
|---|---:|---:|---:|---:|
| `development` | 15 | 9 | 4 | 2 |
| `security` | 10 | 4 | 0 | 6 |
| `devops` | 9 | 4 | 0 | 5 |
| `data-engineering` | 8 | 4 | 1 | 3 |
| `infrastructure` | 13 | 6 | 0 | 7 |
| `ai` | 16 | 8 | 1 | 7 |
| `review` | 15 | 8 | 4 | 3 |
| **Total** | **86** | **43** | **10** | **33** |

## 3) Domain Inventory

### development

- `real-depth` (9)
  - `expert-batching-caching-and-concurrency.md`
  - `expert-bottleneck-diagnosis.md`
  - `expert-config-and-runtime-boundaries.md`
  - `expert-observability-and-shutdown.md`
  - `expert-python-concurrency.md`
  - `expert-python-design-and-types.md`
  - `expert-python-memory-and-runtime.md`
  - `expert-query-shape-and-orm.md`
  - `expert-transactions-pagination-and-write-paths.md`
- `index` (4)
  - `expert-performance-optimization.md`
  - `expert-production-hardening.md`
  - `expert-python-data-access.md`
  - `top-developer-overlays.md`
- `legacy-split` (2)
  - `code-implementation-and-refactoring.md`
  - `debugging-and-test-strategy.md`

### security

- `real-depth` (4)
  - `expert-authn-authz-boundaries.md`
  - `expert-detection-response-and-recovery.md`
  - `expert-layered-controls-and-trust-zones.md`
  - `expert-secret-lifecycle-and-rotation.md`
- `index` (0)
- `legacy-split` (6)
  - `auth-secrets-and-hardening.md`
  - `common-vulnerability-patterns.md`
  - `expert-authz-and-secret-governance.md`
  - `expert-defense-in-depth-architecture.md`
  - `expert-operating-principles.md`
  - `trust-boundaries-and-audit.md`

### devops

- `real-depth` (4)
  - `expert-alerts-runbooks-and-diagnosis.md`
  - `expert-release-gate-design.md`
  - `expert-rollback-and-release-operations.md`
  - `expert-signal-design-and-instrumentation.md`
- `index` (0)
- `legacy-split` (5)
  - `ci-cd-and-release-gates.md`
  - `expert-observability-operations.md`
  - `expert-operating-principles.md`
  - `expert-release-gates.md`
  - `observability-and-incident-readiness.md`

### data-engineering

- `real-depth` (4)
  - `expert-batch-and-orchestration.md`
  - `expert-contracts-quality-and-reconciliation.md`
  - `expert-data-product-framing.md`
  - `expert-streaming-and-state.md`
- `index` (1)
  - `expert-operating-principles.md`
- `legacy-split` (3)
  - `data-quality-and-contracts.md`
  - `etl-and-orchestration.md`
  - `streaming-and-state.md`

### infrastructure

- `real-depth` (6)
  - `expert-cluster-shape-and-environment-strategy.md`
  - `expert-control-plane-and-tenancy.md`
  - `expert-dr-exercises-and-recovery-operations.md`
  - `expert-failover-topology-and-consistency.md`
  - `expert-runtime-policy-and-identity-plane.md`
  - `expert-traffic-governance-and-mesh-adoption.md`
- `index` (0)
- `legacy-split` (7)
  - `expert-cloud-native-topology.md`
  - `expert-multi-region-and-dr.md`
  - `expert-operating-principles.md`
  - `expert-service-mesh-and-runtime-control.md`
  - `gitops-and-drift-control.md`
  - `identity-secrets-and-runtime-ops.md`
  - `kubernetes-and-topology.md`

### ai

- `real-depth` (8)
  - `expert-agent-loop-and-state-control.md`
  - `expert-chunking-ranking-and-grounding.md`
  - `expert-eval-design-and-acceptance.md`
  - `expert-guardrail-policy-and-fallbacks.md`
  - `expert-latency-cost-and-reliability.md`
  - `expert-retrieval-objective-and-corpus-shaping.md`
  - `expert-task-definition.md`
  - `expert-tool-authority-and-boundaries.md`
- `index` (1)
  - `expert-operating-principles.md`
- `legacy-split` (7)
  - `agent-tooling-and-guardrails.md`
  - `expert-context-and-retrieval.md`
  - `expert-guardrails-and-failure-economics.md`
  - `expert-task-framing-and-evals.md`
  - `expert-tool-using-agents.md`
  - `prompt-design-and-evals.md`
  - `rag-and-context-engineering.md`

### review

- `real-depth` (8)
  - `expert-cause-model-and-proof.md`
  - `expert-ci-signal-quality.md`
  - `expert-findings-and-severity.md`
  - `expert-git-and-pr-discipline.md`
  - `expert-mocks-fixtures-and-isolation.md`
  - `expert-recurrence-prevention-and-defect-governance.md`
  - `expert-release-readiness-and-rollback.md`
  - `expert-test-surface-mapping.md`
- `index` (4)
  - `expert-ci-and-release-gates.md`
  - `expert-rca-and-defect-management.md`
  - `expert-test-strategy.md`
  - `top-developer-overlays.md`
- `legacy-split` (3)
  - `expert-operating-principles.md`
  - `findings-prioritization.md`
  - `review-checklist.md`

## 4) Index-Only Files Inflating Depth Claims

The following files are navigation/index surfaces and should not be counted as top-level depth evidence:

- `ai`: `expert-operating-principles.md`
- `data-engineering`: `expert-operating-principles.md`
- `development`: `expert-performance-optimization.md`
- `development`: `expert-production-hardening.md`
- `development`: `expert-python-data-access.md`
- `development`: `top-developer-overlays.md`
- `review`: `expert-ci-and-release-gates.md`
- `review`: `expert-rca-and-defect-management.md`
- `review`: `expert-test-strategy.md`
- `review`: `top-developer-overlays.md`

## 5) Notes For M0-004 Gap Audit

1. Domains with high `legacy-split` volume (`infrastructure`, `ai`, `security`, `devops`) should be prioritized for depth-gap tagging by judgement task.
2. `index` entries are explicit governance debt for depth claims and should remain excluded from top-level proof.
3. This inventory is static at snapshot date `2026-04-22`; rerun after any reference split/merge.
