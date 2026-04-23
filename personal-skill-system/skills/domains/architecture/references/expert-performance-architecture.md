# Expert Performance Architecture

Use this reference when architecture is being constrained by latency, throughput, or cost pressure.

## Optimization pyramid

Work in this order:

1. architecture shape
2. data access
3. cache and batching
4. concurrency model
5. local hot path

## Capacity questions

- what is the dominant workload
- what is the tail-latency target
- where is fan-out created
- which dependency saturates first
- what metric proves the design improved

## Metrics

Track at least:

- P95 and P99 latency
- throughput
- error rate
- saturation
- queue depth
- cache hit ratio

## Anti-patterns

- shaving local CPU while query shape is still wrong
- optimizing average latency while P99 is broken
- adding cache before naming invalidation and fallback rules

