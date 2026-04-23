# Expert Operating Principles

Use this reference when delivery and operations quality must be treated as a real engineering
system rather than a pile of CI jobs.

## Order of judgement

1. deploy frequency and risk
2. rollback speed
3. signal quality
4. environment drift
5. operator load
6. change failure rate

## Core rules

- fast delivery without rollback discipline is fake speed
- CI should fail on meaning, not noise
- every release path should answer who approves, what runs, and how it reverts
- observability exists to shorten diagnosis time, not to decorate dashboards
- toil is an architectural smell when it scales with every release

## Strong system questions

- what blocks a safe deploy today
- what change can land without human heroics
- what signal proves the new version is healthy
- how quickly can the old version be restored
- which pipeline step is expensive but low-value

## Output contract

Produce:

- release path
- gate set
- rollback path
- runtime signals
- ownership model
- toil or fragility hotspots

