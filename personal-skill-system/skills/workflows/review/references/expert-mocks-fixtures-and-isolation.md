# Expert Mocks, Fixtures, And Isolation

Use this reference when review quality hinges on whether the tests are realistic enough to trust.

## Core rules

- broad mocks can hide integration risk
- fixtures should reflect the edge cases that matter
- isolation is good only if it does not erase the failure mode under review

## Strong questions

- what dependency was mocked and why
- whether the fixture represents the real contract
- whether the test would still fail if the bug returned

## Mocking boundaries

- mock at ownership boundaries, not inside the unit under judgement
- avoid mocking protocol semantics that define the real failure mode
- prefer contract fakes over permissive stubs for external dependencies
- require explicit rationale when replacing integration with mocks

## Fixture realism checks

- include malformed, boundary, and stale-state inputs for changed paths
- include version skew or partial payloads when contracts evolve
- include concurrency or ordering-sensitive fixtures where relevant
- include production-like defaults for critical path assumptions

## Isolation strategy

- isolate nondeterminism, not behavior under test
- isolate side effects with deterministic replayable harnesses
- isolate expensive dependencies while preserving contract-level behavior
- isolate flaky infrastructure from correctness assertions

## Anti-patterns

- wildcard mocks that accept any call signature and always succeed
- fixtures copied from previous bugs with no relation to current risk
- tests pass only because mocks mirror implementation internals
- deleting integration tests to reduce flakiness without root-cause fix

## Output contract

Leave behind:

- mock or fixture weakness
- hidden integration risk
- stronger alternative
- confidence impact on approval decision
