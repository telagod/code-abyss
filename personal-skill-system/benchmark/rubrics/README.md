# Rubric Pack v1

Scope: `CARD-M1-005`

This folder defines benchmark scoring language for v1.

Primary dimensions:

- `route_correctness`
- `reasoning_quality`
- `validation_completeness`
- `final_correctness`

## Files

- `rubric-language.v1.md`: shared terms, evidence rules, anti-verbosity policy
- `failure-taxonomy.v1.json`: separates `route`, `depth`, `tool`, `host` failures
- `route-correctness.v1.json`
- `reasoning-quality.v1.json`
- `validation-quality.v1.json`
- `final-correctness.v1.json`
- `scoring-policy.v1.json`: overall score weighting and verdict gates

Compatibility note:

- `route-correctness.v1.example.json` is retained as legacy sample from M1-001.
- Use `*.v1.json` files above as the canonical v1 rubric pack.

## Scoring Procedure

1. Score each task on all four primary dimensions (`0..5`).
2. Classify dominant failure using `failure-taxonomy.v1.json`.
3. Apply gating and verdict rules from `scoring-policy.v1.json`.
4. Record both numeric score and failure class.

## Consistency Rules

- Use task contract fields as evidence:
  - `route_expected`, `route_allowed_alternates`
  - `deliverable_expected`
  - `validation_expected`
  - `risk_focus` (when present)
- Do not award points for length or rhetorical polish.
- A correct-looking output without validation evidence must be marked as shallow success.
