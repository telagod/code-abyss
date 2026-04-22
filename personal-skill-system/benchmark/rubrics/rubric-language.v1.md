# Rubric Language v1

## Purpose

Provide shared scoring language so different evaluators score benchmark tasks consistently.

## Evidence Units

Score only against explicit evidence from task output:

- route decision and route rationale
- deliverable contract coverage
- validation evidence quality
- final correctness against task ask

Use task fields as anchor:

- `route_expected`
- `route_allowed_alternates`
- `deliverable_expected`
- `validation_expected`
- `risk_focus` (optional)

## Scale (`0..5`)

- `0`: missing or dangerously wrong
- `1`: mostly wrong, little usable value
- `2`: partial but unreliable
- `3`: acceptable baseline with notable gaps
- `4`: strong and mostly complete
- `5`: high-confidence, complete, and well-defended

## Failure Classes

Use `failure-taxonomy.v1.json` to assign dominant cause:

- `route`: wrong skill path or unresolved route ambiguity
- `depth`: route is acceptable but domain judgement is thin/generic
- `tool`: deterministic validation/tool handling is missing, misused, or incorrect
- `host`: host/runtime divergence blocks expected behavior
- `none`: no dominant failure class

## Verbosity-Neutral Policy

- Length alone never increases score.
- Repetition without new evidence should not increase score.
- Polished wording without stronger proof should not increase score.

## Shallow vs Validated Success

- `shallow success`: answer appears correct but validation evidence is weak.
- `well-validated success`: answer is correct and supported by explicit validation evidence.

Evaluator must distinguish these states even when final output looks similar.
