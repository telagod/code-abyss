# Expert Battery And Performance Budget

## Use

Use this when polling, background work, animation, or caching may hurt battery, startup, or memory.

## Rules

- background work is expensive by default
- animation cost must be justified by meaning
- network retries and wakeups spend battery, not only time
- large caches need eviction policy and ownership

## Output

- battery budget
- performance hotspots
- cache policy
