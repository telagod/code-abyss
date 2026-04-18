# Expert Streaming And State

Use this reference when the problem is real-time data flow, stateful processing, or replay semantics.

## Core rules

- stream only when freshness changes the business outcome
- state shape should be explicit before engine choice
- replay and late data semantics matter more than marketing claims like exactly-once
- windows and joins should be justified by the decision they enable

## Strong questions

- what event time means here
- how late data is handled
- what state must survive restarts
- what replay should and should not change

## Output contract

Leave behind:

- stream purpose
- state model
- replay semantics
- late-data behavior
- correctness risks

