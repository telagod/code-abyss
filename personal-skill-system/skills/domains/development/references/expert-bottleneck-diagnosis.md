# Expert Bottleneck Diagnosis

Use this reference when performance work starts with "something is slow" and the real task is to
identify the dominant bottleneck before changing code.

## Core rules

- measure before optimizing
- separate CPU, memory, network, storage, and query costs
- tail latency matters more than average when users feel the pain
- the bottleneck is the scarcest resource on the hot path, not the largest function

## Strong questions

- what user-visible path is slow
- what metric proves it
- where time is actually spent
- what resource saturates first
- whether the issue is code, query, network, or concurrency shape

## Output contract

Leave behind:

- dominant bottleneck
- evidence
- discarded false suspects
- next highest-leverage fix

