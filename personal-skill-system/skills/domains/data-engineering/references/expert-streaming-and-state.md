# Expert Streaming And State

Use this reference when the problem is real-time data flow, stateful processing, or replay semantics.

## Core rules

- stream only when freshness changes the business outcome
- state shape should be explicit before engine choice
- replay and late data semantics matter more than marketing claims like exactly-once
- windows and joins should be justified by the decision they enable

## Strong questions

- what event time means here
- how late data is handled
- what state must survive restarts
- what replay should and should not change

## Event-time and state model

- define event-time source and clock-skew tolerance explicitly
- define state key model and retention window by business semantics
- define window strategy and why it matches decision cadence
- define correction model for out-of-order and duplicate events

## Replay and recovery semantics

- define replay scope boundaries and immutable audit checkpoints
- define exactly-what-can-change under replay and what must remain stable
- define state bootstrap strategy after restart or topology changes
- define backpressure and dead-letter handling for persistent failure

## Correctness controls

- attach idempotency keys and dedupe policy to stateful operators
- validate joins with skew and late-arrival scenarios before production
- instrument watermark lag, processing lag, and state-size growth
- classify correctness incidents by downstream decision impact

## Cost and reliability tradeoffs

- choose stream processing only when business value beats operational tax
- cap state growth with explicit eviction or compaction policy
- define graceful degradation path when state store is unavailable
- define on-call runbook for lag storms and partition rebalances

## Anti-patterns

- adopting stream engine for near-real-time vanity instead of decision impact
- treating exactly-once marketing claim as replacement for domain semantics
- ignoring state migration plan until schema evolution blocks deploy
- replaying whole history without guardrails in shared production environment

## Output contract

Leave behind:

- stream purpose
- state model
- replay semantics
- late-data behavior
- correctness risks
- lag and state-growth guardrail thresholds
