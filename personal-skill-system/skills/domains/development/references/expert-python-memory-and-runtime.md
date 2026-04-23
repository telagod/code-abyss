# Expert Python Memory And Runtime

Use this reference when Python runtime pressure is part of the problem.

## Core rules

- object lifetime matters more than one clever micro-optimization
- generators beat materialization when data is naturally streamed
- `__slots__` is a population optimization, not a default style rule
- measure allocation and residency before tuning GC

## Runtime pressure classes

- allocation pressure: short-lived object churn causing CPU/GC overhead
- residency pressure: long-lived object retention causing memory growth
- fragmentation pressure: allocator behavior reducing effective memory headroom
- boundary pressure: serialization/copy overhead across process or thread boundaries

## Watch for

- hidden retention via caches and closures
- accidental list building in data pipelines
- reference cycles in long-lived objects
- large object graphs passed across process boundaries

## Measurement first

- capture memory timeline across warmup, steady state, and load spikes
- separate RSS growth from Python heap growth before choosing mitigation
- profile hot allocations by callsite, not by file size intuition
- validate improvements with representative workload replay

## Mitigation patterns

- replace eager materialization with iterators or chunked processing
- cap cache size and TTL with explicit eviction strategy
- reduce object shape overhead for high-population structures
- move serialization boundary later to avoid duplicate object graphs

## Anti-patterns

- forcing GC tuning before finding retention source
- adding cache to fix latency while ignoring memory budget
- switching runtime components without baseline measurement
- optimizing microbenchmarks that do not match production profile

## Good output

Leave behind:

- main memory pressure source
- object-lifetime explanation
- mitigation strategy
- tradeoff on readability or CPU cost
- verification metric after mitigation
