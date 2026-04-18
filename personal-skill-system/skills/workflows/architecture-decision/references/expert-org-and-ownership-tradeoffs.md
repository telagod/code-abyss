# Expert Org And Ownership Tradeoffs

Use this reference when the architecture decision also changes who builds, owns, or operates the system.

## Questions

- who owns the new boundary
- who is on call after rollout
- what new skill must the team absorb
- what part of the decision creates platform tax
- what governance will stop the architecture from decaying

## Rules

- an elegant design with no real owner is a bad decision
- operational complexity counts as product cost
- team capability is a first-class constraint, not an embarrassment

## Failure modes

- ownership split across teams with no real incident owner
- platform tax added faster than the team can absorb
- architecture chosen for prestige instead of operability
- governance assumed but not actually assigned

## Output contract

Leave behind:

- owner map
- new operator burden
- team capability gap
- governance mechanism
