# Expert Batch And Orchestration

Use this reference when the hard part is designing dependable scheduled or backfill-friendly data flows.

## Core rules

- batch is the default until lower latency is justified
- orchestration should reflect dependency truth, not cosmetic DAG beauty
- idempotency should be designed before retries are turned on
- backfill is not an edge case; it is a design requirement

## Strong questions

- what is the unit of re-run
- what happens if one stage partially succeeds
- how is duplicate processing prevented
- how are failures surfaced to operators

## Output contract

Produce:

- DAG or stage boundary
- retry and idempotency stance
- backfill plan
- operator signal path

