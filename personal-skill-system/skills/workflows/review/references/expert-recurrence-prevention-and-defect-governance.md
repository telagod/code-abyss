# Expert Recurrence Prevention And Defect Governance

Use this reference when review quality depends on whether the team is reducing recurrence, not just closing the current bug.

## Core rules

- regression protection is part of the fix
- repeated failure classes should change either prevention or detection
- “known issue” is not a governance strategy

## Strong questions

- what prevents the same bug from returning
- what would detect it sooner next time
- whether the team changed anything beyond the local patch

## Prevention layers

- code-level guards: invariant checks and safer defaults near failure boundary
- test-level guards: regression tests targeting mechanism-level trigger
- pipeline-level guards: lint, schema, or policy checks for known defect class
- runtime-level guards: alerts and SLO-based anomaly detection for early signal

## Governance loop

- classify defect by recurring failure family, not one-off ticket title
- assign owner for class-level prevention, not only patch-level closure
- track recurrence rate and time-to-detection for the class
- require closure evidence before downgrading severity of repeated failures

## Escalation rules

- repeated medium severity incidents should trigger systemic prevention work
- one high-severity recurrence should trigger leadership-visible review
- workaround-only fixes require explicit expiry and replacement plan
- "cannot reproduce" closure should include monitoring strategy and decision owner

## Anti-patterns

- closing defect with no regression assertion because fix appears obvious
- repeatedly reopening the same bug family under new ticket IDs
- documenting known issue without owner or mitigation horizon
- relying on hero debugging instead of structural detection improvements

## Output contract

Leave behind:

- recurrence risk
- prevention gap
- governance next step
- owner and trigger for follow-up verification
