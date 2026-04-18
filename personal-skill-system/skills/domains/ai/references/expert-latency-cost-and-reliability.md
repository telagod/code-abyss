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

## Operating rules

- expensive calls should exist only where cheaper structure cannot replace them
- latency budgets should be allocated per stage, not only per request
- graceful degradation should be defined before incidents force it
- cache and batching policy should be justified by hit rate and staleness tolerance

## Output contract

Leave behind:

- latency budget
- cost budget
- degradation plan
- reliability boundary
