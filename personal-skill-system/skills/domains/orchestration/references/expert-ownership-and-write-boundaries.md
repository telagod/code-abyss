# Expert Ownership And Write Boundaries

Use this reference when collaboration quality depends on clear ownership.

## Core rules

- one owner per write surface unless a merge plan is explicit
- ownership should follow responsibility for correctness
- shared files are risk hotspots, not neutral terrain
- invisible ownership creates integration debt

## Boundary heuristics

- write boundaries should be declared before parallel work starts
- ownership should track the boundary where failure is most expensive
- shared files should be minimized or elevated as deliberate integration points
- merge policy should be explicit when boundaries cannot be perfectly isolated

## Failure modes

- several agents edit the same surface with no integration owner
- ownership follows convenience rather than correctness
- hidden shared files create surprise merge debt
- responsibility is split but nobody owns outcome integrity

## Output contract

Leave behind:

- owner map
- write boundaries
- shared-file hotspots
- escalation path for conflicts
- merge policy
