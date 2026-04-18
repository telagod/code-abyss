# Expert Pattern Selection

Use this reference when the hard part is choosing the architectural shape itself.

## Pattern fit guide

### Modular monolith

Prefer when:

- the team is still small
- domain boundaries are still moving
- release coordination is cheaper than distributed operations

### Layered or hexagonal

Prefer when:

- business logic should outlive frameworks
- adapters and dependencies need isolation
- testability matters early

### Event-driven

Prefer when:

- fan-out and asynchronous work dominate
- integration pressure is high
- temporal buffering is more valuable than immediate consistency

### Microservices

Prefer only when:

- ownership boundaries are already legible
- independent scaling or deploy is necessary
- the team can pay the platform and observability tax

### CQRS or event sourcing

Prefer when:

- read and write shapes diverge materially
- audit history has business value
- eventual consistency is acceptable

## Anti-patterns

- microservices because “we will scale someday”
- queues used to hide unclear ownership
- event sourcing without replay or projection discipline
- hexagonal architecture copied into tiny local scripts for aesthetics

