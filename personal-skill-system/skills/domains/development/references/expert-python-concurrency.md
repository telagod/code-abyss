# Expert Python Concurrency

Use this reference when the hard part is choosing the right concurrency model.

## Selection order

- high fan-out I/O -> `asyncio`
- blocking library with limited change budget -> threads
- CPU-bound work -> processes
- durable background work -> queue and workers

## Core rules

- do not mix blocking work into the event loop
- do not add async only for style
- concurrency without backpressure is deferred failure
- cancellation, timeout, and shutdown behavior matter as much as throughput

## Watch for

- hidden sync calls in async paths
- thread safety assumptions around shared state
- process fan-out with heavy serialization cost
- no concurrency cap around remote I/O

