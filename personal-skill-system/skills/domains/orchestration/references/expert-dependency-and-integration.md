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

## Dependency mapping

- identify critical path and non-critical parallel branches explicitly
- define hard dependencies versus soft dependencies with fallback behavior
- define contract version assumptions between producers and consumers
- define integration freeze point where dependency churn is controlled

## Integration rules

- dependency order should be explicit before execution begins
- a phase is not complete until its output is consumable by the next phase
- stubbed work should declare what remains unproven
- integration ownership should be singular unless deliberately split

## Integration proof points

- contract tests passing on producer and consumer sides
- migration or compatibility checks passing for boundary data contracts
- environment parity checks for integration-critical configuration
- end-to-end smoke proving artifact handoff is executable, not only described

## Integration checkpoints

- checkpoint 1: dependency contracts are frozen for current integration window
- checkpoint 2: upstream artifacts are consumable without manual patching
- checkpoint 3: cross-stream compatibility proof is green on target environment
- checkpoint 4: final integrator sign-off includes unresolved debt list

## Concurrency boundaries

- parallel work should not write to the same authoritative surface
- shared files or schemas require explicit owner and merge protocol
- temporary stubs must carry expiry criteria and replacement owner
- conflict resolution path should be named before parallel execution starts

## Risk triage

- high: unresolved contract mismatch on critical path blocks merge
- medium: fallback exists but integration behavior is only partially proven
- low: non-critical path deferred with bounded, owned debt
- unknown: insufficient evidence; escalate before claiming readiness

## Anti-patterns

- parallelization chosen without ownership and write-boundary design
- "integration later" deferred until all branches are already divergent
- mocked success treated as final readiness without real consumer proof
- final integrator role implied but never assigned

## Output contract

Leave behind:

- dependency chain
- integration artifact
- readiness signal
- final integrator
- unresolved integration debt with owner and due trigger
- integration checkpoint history and risk level
