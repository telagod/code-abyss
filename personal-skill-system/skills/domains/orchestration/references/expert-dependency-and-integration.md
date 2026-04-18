# Expert Dependency And Integration

Use this reference when sequencing and final integration are the hard parts.

## Core rules

- dependency order matters more than enthusiasm for parallelism
- integration artifacts should be declared before work begins
- a phase is not complete until its output is consumable by the next phase

## Strong questions

- what blocks what
- what can be mocked or stubbed
- what proves integration readiness
- who owns final merge or integration

## Integration rules

- dependency order should be explicit before execution begins
- a phase is not complete until its output is consumable by the next phase
- stubbed work should declare what remains unproven
- integration ownership should be singular unless deliberately split

## Output contract

Leave behind:

- dependency chain
- integration artifact
- readiness signal
- final integrator
