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

## Output contract

Leave behind:

- changed surface
- required test layers
- missing evidence

