# Expert Python Design And Types

Use this reference when Python quality depends on architecture-level code shape rather than only
syntax cleanliness.

## Core rules

- model boundaries before functions
- use types to remove ambiguity, not to impress linters
- let data shape stay explicit at system boundaries
- make public contracts smaller than internal implementation detail

## Prefer

- `dataclass` for simple data carriers
- validation objects at untrusted boundaries
- `Protocol` when behavior matters more than inheritance
- dependency inversion only where testing or boundary isolation improves

## Watch for

- type hints that decorate but do not constrain
- implicit dict-shaped contracts everywhere
- leaking framework models into domain logic
- public helpers that should stay internal

