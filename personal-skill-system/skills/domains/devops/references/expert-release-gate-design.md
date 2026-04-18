# Expert Release Gate Design

Use this reference when the question is what should actually block or allow a release.

## Core rules

- gates should reflect blast radius and rollback cost
- different change classes should not share identical gate depth
- evidence must be explicit enough that a human can defend the go decision
- gates should be composable, not ceremonial clutter

## Strong questions

- what this gate protects
- what release class requires it
- what signal proves the gate passed meaningfully
- what failure would still slip through

## Design rules

- gate depth should scale with blast radius and rollback cost
- evidence requirements should be explicit enough for human approval
- high-cost gates should only exist where they block high-cost mistakes
- release classes should not inherit identical gate stacks by laziness

## Output contract

Leave behind:

- protected risk
- gate owner
- evidence required
- known residual gap
