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

## Run model

- define partition key and replay window explicitly
- define first-safe publish point where downstream can consume outputs
- define late-data handling and watermark policy
- define when to choose incremental run versus full backfill

## Idempotency and replay rules

- use deterministic output keys tied to business identity and run window
- avoid side-effecting writes before checkpointed stage completion
- retries should be bounded and classified by transient versus permanent failure
- backfill should reuse production code path unless explicitly justified

## Dependency and DAG rules

- upstream readiness should be validated by data-quality and freshness signals
- stage boundaries should match ownership boundaries for fault isolation
- fan-in stages should define merge semantics for partial upstream completion
- task retries should not violate ordering constraints for stateful sinks

## Data quality and publication gates

- gate publish on schema validation, null-rate, and cardinality sanity checks
- record lineage and run metadata for every published batch artifact
- block downstream promotion when reconciliation mismatch crosses threshold
- alert severity should map to business impact, not only row counts

## Scheduling and backfill policy

- define rerun scope by partition and time window, not by ad hoc file list
- define SLA-aware scheduling class for critical versus best-effort workloads
- define backfill throttle policy to protect online workloads
- define replay cutoff and irrecoverable-gap escalation rule

## Recovery objectives

- define maximum tolerated catch-up lag by product class
- define recovery decision owner when upstream or sink is degraded
- define when to pause downstream publication versus publish with warning
- define operator checklist for partial-stage recovery and restart

## Anti-patterns

- backfill implemented as ad hoc script outside orchestrator controls
- retries enabled globally without idempotency contract
- cosmetic DAG layers added without ownership or recovery value
- "successful run" declared before data-quality gates pass

## Output contract

Produce:

- DAG or stage boundary
- retry and idempotency stance
- backfill plan
- operator signal path
- publish gate criteria and reconciliation stance
- recovery objective and pause/resume policy
