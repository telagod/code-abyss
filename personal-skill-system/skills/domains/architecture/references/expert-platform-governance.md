# Expert Platform Governance

Use this reference when the architecture question is partly technical and partly organizational.

## Governance questions

- who owns each boundary
- who operates each system after launch
- what ADR should be written
- how is drift reviewed
- what is the cost of platform complexity
- what review gate will protect future changes

## Governance model

- decision rights: who can design, approve, and override architecture decisions
- ownership rights: who is accountable for runtime behavior and incident outcomes
- change rights: what changes require ADR, cross-team review, or gate escalation
- rollback rights: who can trigger emergency rollback and under what thresholds

## Architecture governance checks

- every critical boundary has one accountable owner and explicit backup
- every platform abstraction has a cost owner and retirement criteria
- every risky architecture decision has ADR link, expiry review date, and fitness signal
- every control-plane change has rollback path and operator runbook touchpoint

## ADR and drift discipline

- ADR should capture alternatives rejected and their tradeoff rationale
- architecture drift should be reviewed on cadence, not only after incidents
- cross-team boundary changes should include compatibility window and migration owner
- governance debt should be tracked as delivery work, not informational TODO

## Observability contract

Every serious architecture should leave:

- logging stance
- metrics stance
- tracing stance
- alerting stance
- operator runbook hints

## Team-fit rules

- a pattern the team cannot operate is not a good pattern
- platform ambition should not outgrow actual ownership
- governance debt compounds slower than production incidents, but it does compound

## Anti-patterns

- platform-wide standards declared with no enforcement gate
- ownership split by component but incident accountability left ambiguous
- architectural "temporary exception" with no expiry trigger
- adding control-plane layers without operating budget or ownership runway

## Output contract

Leave behind:

- governance model and decision-right map
- boundary ownership and on-call accountability map
- ADR + drift review mechanism
- gate policy for risky architectural change
