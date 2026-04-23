# Expert Signal Design And Instrumentation

Use this reference when observability work starts at the level of what signals should exist at all.

## Core rules

- every important path should emit enough signal to explain health and degradation
- instrumentation should follow decision points, not random code locations
- version, boundary, and latency context matter more than verbose chatter
- missing signal is technical debt, not only an ops inconvenience

## Strong questions

- what operators need to know first during failure
- where a latency or error budget is won or lost
- what boundary transitions require explicit instrumentation
- what signal is actionable versus decorative

## Instrumentation rules

- critical paths should emit version, boundary, latency, and failure context
- instrumentation should follow decision points, not random code locations
- saturation and queueing signals matter as much as raw error counts
- signal design should reduce diagnosis time, not only increase dashboard density

## Signal taxonomy

Separate signals into:

- health
- latency
- throughput
- saturation
- correctness or reconciliation
- release identity

## Strong heuristics

- version and environment identity should be attached close to critical paths
- boundary transitions deserve more instrumentation than leaf utility code
- cardinality should be controlled intentionally, not discovered after cost spikes
- operator questions should drive instrumentation design

## Failure modes

- enough logs to be noisy but not enough context to diagnose
- metrics that trend nicely but answer no operator question
- release identity missing during rollback or incident comparison
- instrumentation cost so high that teams disable the most useful signals

## Output contract

Leave behind:

- signal taxonomy
- boundary instrumentation map
- version and environment tagging rule
- cardinality risk
- blind spots

## Output contract

Leave behind:

- signal set
- boundary instrumentation map
- actionability note
- blind spots
