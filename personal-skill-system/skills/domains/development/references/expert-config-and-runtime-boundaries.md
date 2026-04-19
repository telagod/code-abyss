# Expert Config And Runtime Boundaries

Use this reference when production hardening depends on whether runtime configuration and boundaries are well-defined.

## Core rules

- configuration is part of the runtime contract
- hidden ambient environment dependencies are operational debt
- boundary defaults should be safe and observable
- startup success is not enough if runtime assumptions are fragile

## Strong questions

- what config is required versus optional
- which values are environment-specific
- what happens when config is missing or malformed
- which runtime boundaries depend on external systems

## Config classification

- required config: startup must fail fast when absent or invalid
- optional config: safe default exists and degradation is explicit
- secret config: access path and rotation policy are explicit
- dynamic config: update mechanism and consistency boundary are explicit

## Validation and safety rules

- validate schema, range, and enum constraints before serving traffic
- reject unknown critical keys when strict mode is enabled
- log sanitized config fingerprint for deploy traceability
- surface config health status in readiness or diagnostics endpoints

## Runtime boundary controls

- declare dependency boundaries and timeout budgets per external system
- guard boundary calls with retry policy, breaker, and fallback semantics
- distinguish boundary hard-fail versus soft-degrade behavior
- require explicit owner for each boundary contract and change policy

## Anti-patterns

- behavior switched by undocumented env variable flags
- permissive parsing that silently accepts malformed config
- startup validates config but runtime hot reload bypasses validation
- default values chosen for convenience instead of risk posture

## Output contract

Leave behind:

- config contract
- runtime boundary assumptions
- failure behavior on bad config
- boundary owner and change policy
