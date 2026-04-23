# Task Sets

Place domain task files here.

Recommended file naming:

`tasks.<domain>.v1.json`

Each task item should include at minimum:

- `task_id`
- `prompt`
- `route_expected`
- `deliverable_expected`
- `scoring_notes`

## Batch A (CARD-M1-003)

Created task sets:

- `architecture/tasks.architecture.v1.json`
- `development/tasks.development.v1.json`
- `review/tasks.review.v1.json`

Batch A rules used:

- at least 10 high-signal tasks per listed domain
- each domain mixes `explicit`, `implicit`, and `ambiguous` intent types
- each task includes route expectation and expected deliverable contract

Additional recommended fields:

- `intent_type`
- `route_allowed_alternates`
- `validation_expected`

## Batch B (CARD-M1-004)

Created task sets:

- `security/tasks.security.v1.json`
- `ai/tasks.ai.v1.json`
- `chart-visualization/tasks.chart-visualization.v1.json`
- `orchestration/tasks.orchestration.v1.json`

Batch B rules used:

- at least 10 high-signal tasks per listed domain
- chart and orchestration prompts must require concrete technical outputs (no style-only or vague planning prompts)
- each task includes risk focus and validation expectations suitable for benchmark scoring

Additional recommended fields for Batch B:

- `risk_focus`
