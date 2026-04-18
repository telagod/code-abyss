# Expert Python Memory And Runtime

Use this reference when Python runtime pressure is part of the problem.

## Core rules

- object lifetime matters more than one clever micro-optimization
- generators beat materialization when data is naturally streamed
- `__slots__` is a population optimization, not a default style rule
- measure allocation and residency before tuning GC

## Watch for

- hidden retention via caches and closures
- accidental list building in data pipelines
- reference cycles in long-lived objects
- large object graphs passed across process boundaries

## Good output

Leave behind:

- main memory pressure source
- object-lifetime explanation
- mitigation strategy
- tradeoff on readability or CPU cost

