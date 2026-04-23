# Records Archive Index (2026-04-23)

## Verdict

Use logical archival first.

Do not physically move older docs until references are rewritten and validated.

## Status Labels

| Status | Meaning |
|---|---|
| `canonical` | Current source for decisions or evidence. |
| `active` | Still useful for ongoing work. |
| `historical` | Preserved for context, not current authority. |
| `superseded` | Replaced by newer docs. |
| `raw-evidence` | Imported model or external assessment, must be verified before use. |

## Current Canonical Set

| File | Status | Reason |
|---|---|---|
| `docs/SKILL_SOURCE_OF_TRUTH_DECISION_2026-04-23.md` | `canonical` | Current source-of-truth decision. |
| `docs/TOP_DEVELOPER_PROMOTION_DECISION_2026-04-23.md` | `canonical` | Current top_developer policy. |
| `docs/LOCAL_CI_SMOKE_POLICY_2026-04-23.md` | `canonical` | Current local-vs-CI smoke policy. |
| `docs/MULTI_MODEL_EVALUATION_PROTOCOL_2026-04-23.md` | `canonical` | Current model review protocol. |
| `docs/PERSONAL_SKILL_SYSTEM_TOP_TIER_EXECUTION_PLAN_2026-04-23.md` | `canonical` | Current execution plan and task card map. |
| `docs/PERSONAL_SKILL_SYSTEM_VNEXT_TOP_LEVEL_ROADMAP_2026-04-22.md` | `active` | Still authoritative for vNext direction. |
| `docs/BASELINE_SNAPSHOT_2026-04-22.md` | `active` | Current baseline snapshot. |
| `docs/DOMAIN_THICKNESS_GAP_AUDIT_2026-04-22.md` | `active` | Current domain gap evidence. |
| `docs/EXPERT_REFERENCE_CLASSIFICATION_2026-04-22.md` | `active` | Current reference classification. |
| `docs/HOST_SMOKE_MATRIX_2026-04-22.md` | `active` | Current host smoke definition. |
| `docs/CAPABILITY_MODULE_RATINGS.md` | `active` | Current manual capability ratings. |

## Raw Imported Evidence

| File | Status | Handling |
|---|---|---|
| `docs/glm-5.1-project-diagnosis.md` | `raw-evidence` | Keep immutable; use `benchmark/model-reviews/glm-5.1-project-diagnosis.review.json` for verified findings. |

## Historical Or Superseded Planning Records

| File | Status | Reason |
|---|---|---|
| `docs/ORIGINAL_COVERAGE_AUDIT.md` | `historical` | Superseded by baseline and capability ratings. |
| `docs/PERSONAL_SKILL_SYSTEM_BLUEPRINT.md` | `historical` | Architecture context; not current task source. |
| `docs/ITERATION_HANDOFF.md` | `historical` | Large handoff record; use only for trace context. |
| `docs/SKILL_TOP_LEVEL_AUDIT_2026-04-20.md` | `historical` | Useful internal frame, but absolute top-tier claim now requires newer proof gates. |
| `docs/SKILL_TOP_LEVEL_UPGRADE_BACKLOG_2026-04-20.md` | `superseded` | Replaced by vNext backlog and 2026-04-23 execution plan. |
| `docs/PERSONAL_SKILL_SYSTEM_VNEXT_IMPLEMENTATION_BACKLOG_2026-04-22.md` | `active` | Still useful as backlog source, but cards are refined by the 2026-04-23 execution plan. |
| `docs/PERSONAL_SKILL_SYSTEM_VNEXT_CODEX_TASK_CARDS_2026-04-22.md` | `active` | Still useful, but 2026-04-23 execution plan is the newer card map. |

## Domain And Integration Records

| File | Status | Reason |
|---|---|---|
| `docs/TOP_DEVELOPER_EMBEDDING.md` | `active` | Source for top_developer extraction strategy. |
| `docs/CHART_VISUALIZATION_INTEGRATION.md` | `historical` | Chart integration context; current truth is registry and skill files. |
| `docs/ANTV_INTEGRATION_VERDICT_2026-04-20.md` | `historical` | Integration verdict context. |
| `docs/EXPERT_REFERENCE_CLASSIFICATION_RULES_2026-04-22.md` | `active` | Classification method still valid. |
| `docs/ROUTE_METADATA_FIELDS_2026-04-22.md` | `active` | Route metadata extension reference. |
| `docs/ROUTE_HYBRID_ENGINE_M2_004_2026-04-22.md` | `active` | Hybrid routing implementation note. |

## User And Release Docs

| File | Status | Reason |
|---|---|---|
| `docs/MANUAL_IMPORT_GUIDE.md` | `active` | Still useful for manual host import. |
| `docs/NEWCOMER_OPTIMAL_CALLING_GUIDE.md` | `active` | Still useful for usage behavior. |
| `docs/SKILL_TRIGGER_CASEBOOK.md` | `active` | Still useful for route examples. |
| `docs/TEAM_ONBOARDING_ONE_PAGER.md` | `active` | Still useful for onboarding. |
| `docs/RELEASE_NOTES_2026-04-19.md` | `historical` | Release snapshot. |
| `docs/README.md` | `active` | Docs entry point. |

## Archive Rules

- Do not delete historical docs.
- Do not move docs that are still referenced by active files.
- When a doc is superseded, create a newer canonical doc and link it from this index.
- Use raw model reviews only after converting them into verified model-review records.

