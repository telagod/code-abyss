# Expert Query Shape And ORM

Use this reference when the real problem is query design, not Python syntax.

## Core rules

- query shape beats ORM taste
- N+1 is a boundary failure, not just a performance smell
- eager loading and bulk lookup should follow real access patterns
- pagination strategy should match workload and sort requirements

## Strong questions

- what data is actually needed
- what the ORM is generating
- where repeated lookups are hidden
- whether pagination is offset or keyset appropriate
- what index assumptions the code is making

## Output contract

Leave behind:

- query-shape diagnosis
- ORM misuse or boundary issue
- concrete rewrite direction

