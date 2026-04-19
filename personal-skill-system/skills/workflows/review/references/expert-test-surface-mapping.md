# Expert Test Surface Mapping

Use this reference when the hard part is deciding what the changed surface actually demands from tests.

## Core rules

- changed contract should imply changed or justified-existing tests
- pick the cheapest test layer that proves the risk
- user-visible contract changes deserve stronger evidence than internal refactors

## Strong questions

- what behavior changed
- what could regress
- which test layer proves it most cheaply
- whether current tests actually touch the changed boundary

## Surface classification

- interface surface: API schema, protocol behavior, and error semantics
- state surface: persistence, migration, idempotency, and ordering behavior
- operational surface: timeouts, retries, resource pressure, and failover behavior
- security surface: authz, trust boundaries, and sensitive data handling

## Layer mapping rules

- unit tests validate local invariants and edge-branch behavior
- integration tests validate cross-component contracts and data boundaries
- end-to-end tests validate user-visible flow and rollout-critical scenarios
- property or fuzz tests validate invariants with high input variability

## Evidence sufficiency

- changed high-risk surface without matching evidence is a blocker
- existing tests may be reused only if they explicitly cover changed semantics
- "test exists" is insufficient; assertions must guard the failure scenario
- release-critical paths need at least one high-fidelity proof layer

## Anti-patterns

- adding broad snapshot tests instead of behavior assertions
- claiming integration coverage via isolated unit mocks
- testing happy path only when failure handling changed
- relying on CI green without mapping tests to changed boundaries

## Output contract

Leave behind:

- changed surface
- required test layers
- missing evidence
- minimum additional proof needed for approval
