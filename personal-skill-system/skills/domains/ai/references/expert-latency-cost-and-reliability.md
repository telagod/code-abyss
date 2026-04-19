# Expert Latency, Cost, And Reliability

Use this reference when the AI system is good enough functionally but may fail economically or operationally.

## Core rules

- latency budget is part of product behavior
- cost should be measured per useful outcome, not per raw request
- reliability includes timeout, degradation, and retriable failure handling
- expensive model calls should only exist where cheaper structure cannot replace them

## Strong questions

- what latency users will tolerate
- what per-task cost is acceptable
- which calls can be cached, downgraded, or skipped
- how the system behaves when the model or retrieval layer degrades

## Budget model

- define end-to-end latency budget by user interaction class
- define stage budgets: retrieval, reasoning, tool execution, and rendering
- define cost budget per successful outcome, not per incoming request
- define reliability target by failure class and recovery time expectation

## Operating rules

- expensive calls should exist only where cheaper structure cannot replace them
- latency budgets should be allocated per stage, not only per request
- graceful degradation should be defined before incidents force it
- cache and batching policy should be justified by hit rate and staleness tolerance

## Degradation ladder

- level 0: full-quality path with full retrieval and strongest model tier
- level 1: narrower context and cheaper model with stricter output scope
- level 2: template or deterministic fallback with explicit uncertainty
- level 3: abstain or human escalation when correctness risk exceeds threshold

## Reliability controls

- classify timeouts as model, retrieval, tool, or downstream dependency failures
- enforce retry budgets with jitter and idempotency boundaries
- isolate slow or expensive tool paths behind circuit breakers
- record fallback activation and user-impact severity for post-incident tuning

## Anti-patterns

- optimizing p50 latency while ignoring p95 and timeout tails
- lowering model quality without checking downstream correction cost
- adding cache without cache invalidation and freshness contract
- claiming reliability without degradation drills under dependency failure

## Output contract

Leave behind:

- latency budget
- cost budget
- degradation plan
- reliability boundary
- fallback activation threshold and owner
