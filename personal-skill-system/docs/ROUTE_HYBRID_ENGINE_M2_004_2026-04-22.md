# ROUTE HYBRID ENGINE (M2-004) - 2026-04-22

Scope:
- `personal-skill-system/skills/tools/lib/skill-system-routing.js`
- `personal-skill-system/registry/route-fixtures.generated.json`

Card: `CARD-M2-004`

## 1) Stage Order

Routing now executes in four deterministic stages:

1. explicit invocation precedence
2. heuristic candidate generation (priority + keyword/alias matching)
3. semantic rerank (intent tags + rationale wins/avoid + conflict proximity)
4. confidence gate and fallback policy

## 2) Semantic Rerank Inputs

Per-route semantic score uses:

- `activation.intent-tags` vs inferred query intents
- `rationale.wins-when` positive semantic hits
- `rationale.avoid-when` negative semantic hits
- `conflicts-with` near-tie penalty for mixed intent pairs
- explicit-only penalty when `requires-explicit-invocation=true` but no explicit invocation is present

## 3) Confidence Contract

Each candidate reports confidence with:

- `score` (0-100)
- `band` (`low` | `minimum` | `strong` | `very-strong`)
- route-level thresholds from `confidence.minimum-score`, `strong-score`, `very-strong-score`

The selected candidate is allowed to route directly only when confidence meets minimum threshold, or when explicit invocation precedence applies.

## 4) Fallback Contract

When selected confidence is below `minimum-score` and route metadata requires fallback:

- `ask-one-question`: return no selected skill and emit one clarification question.
- `do-not-auto-route`: return no selected skill and wait for explicit invocation.
- `direct-route`: reserved path; direct selection can be retained by policy.

Fallback is now returned as structured data:

- `required`
- `mode`
- `clarifyQuestion`
- `defaultAction`
- `safeSkill`
- `forSkill`
- `confidenceScore`
- `minimumScore`

## 5) Fixture Coverage Added

New fixture classes validate:

- mixed-intent ask-one-question fallback
- explicit-only validator do-not-auto-route fallback when not explicitly invoked
- explicit invocation bypassing fallback

This makes fallback behavior regression-testable in `verify-skill-system` and unit tests.
