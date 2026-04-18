# Expert Contracts, Quality, And Reconciliation

Use this reference when trust in the data matters as much as moving it.

## Core rules

- contracts beat reverse engineering
- quality gates belong in the pipeline, not only in dashboards
- reconciliation should be designed, not improvised after an incident
- exactly matching business totals is often more important than pretty schemas

## Strong questions

- what contract is enforced and where
- what quality check blocks bad data
- how is bad data quarantined or corrected
- how is a disputed metric reconciled

## Contract taxonomy

Separate:

- schema contract
- semantic contract
- freshness contract
- reconciliation contract

## Quality rules

- bad data should fail or quarantine deliberately, not leak silently
- reconciliation should be designed around business trust, not only row counts
- contract owners should be named at producer and consumer boundaries
- quality gates should fire close enough to the source that recovery stays affordable

## Failure modes

- schema passes while meaning is wrong
- freshness slips but no downstream consumer knows
- disputed metrics are resolved socially instead of mechanically
- contract drift is detected only after dashboard trust is gone

## Output contract

Leave behind:

- contract types
- gate location
- quarantine or correction path
- reconciliation owner
- trust limit statement

## Output contract

Produce:

- contract boundary
- quality gate location
- reconciliation flow
- trust limits of the dataset
