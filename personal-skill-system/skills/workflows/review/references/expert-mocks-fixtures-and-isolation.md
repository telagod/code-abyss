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

## Output contract

Leave behind:

- mock or fixture weakness
- hidden integration risk
- stronger alternative

