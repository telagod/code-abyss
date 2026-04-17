# Debugging And Test Strategy / 调试与测试策略

## 1. Debugging Starts With Reproduction

Never debug a ghost story.

First pin down:

- input
- environment
- trigger condition
- observed result
- expected result

## 2. Narrow The Search Surface

Use the shortest chain of evidence:

- failing test
- log or stack trace
- config diff
- smallest reproducible input

Avoid “read everything” unless the system is truly opaque.

## 3. Test Selection Rules

- unit tests for isolated logic
- integration tests for contract boundaries
- end-to-end tests for user-visible paths
- regression tests for previously broken behavior

Choose the narrowest test that proves the claim.

## 4. When To Add A Test

Add or update a test when:

- behavior changed
- a bug was fixed
- a public contract moved
- edge-case handling was introduced

## 5. Review Questions

- how is the bug reproduced
- what evidence points to the cause
- what test prevents the same failure again
- did the validation scope match the change scope
