# Expert Work Decomposition

Use this reference when the main problem is how to split a large effort without creating chaos.

## Core rules

- split by responsibility, not by equal ticket count
- decompose around stable interfaces or deliverables
- one stream should have one objective, not several unrelated chores
- parallelism is only useful when integration stays cheaper than the gain

## Decomposition strategy

- separate discovery, implementation, and integration work streams explicitly
- align streams to ownership boundaries and authoritative write surfaces
- define stream-level acceptance criteria before execution begins
- define dependency-critical streams that must stay on the critical path

## Stream quality checks

- each stream has a single objective and measurable completion signal
- each stream declares upstream assumptions and downstream artifact contract
- each stream has explicit risk owner and escalation path
- each stream has rollback or fallback plan if assumptions break

## Parallelism gates

- allow parallel execution only when write surfaces are disjoint or mediated
- require integration checkpoint before opening additional dependent streams
- suspend parallel fan-out when unresolved architectural uncertainty remains
- prefer fewer high-confidence streams over many ambiguous streams

## Anti-patterns

- splitting by ticket count to appear parallel without reducing risk
- stream boundaries changing mid-flight without ownership update
- hidden cross-stream dependencies discovered during final merge
- "done" declared without consumable artifact for next stream

## Output contract

Leave behind:

- work streams
- objective of each stream
- blocking versus parallel work
- major merge or integration risk
- stream acceptance criteria and owner map
