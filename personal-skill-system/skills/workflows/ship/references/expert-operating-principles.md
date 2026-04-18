# Expert Operating Principles

Use this reference when shipping quality must reflect release engineering judgement rather than a
generic checklist pass.

## Order of judgement

1. target and branch truth
2. change impact
3. required evidence
4. rollback speed
5. release blast radius
6. operator confidence after deploy

## Core rules

- never ship from a guessed branch state
- release notes without risk notes are cosmetic
- rollback plan must be concrete, not emotional
- the narrowest meaningful checks should run before landing
- if a release changes operations, observability must change too

## Failure modes

Watch for:

- merging with stale branch assumptions
- passing checks that do not cover the changed surface
- no rollback trigger defined
- user-facing impact not documented
- operational burden handed to someone else without warning

## Go / no-go criteria

Go when:

- branch state is coherent
- relevant checks passed
- impact and risk are named
- rollback path is usable

No-go when:

- a critical unknown remains
- verification scope is obviously too small
- rollout or rollback ownership is unclear

## Output contract

Leave behind:

- target
- checks run
- user-facing impact
- risk summary
- rollback path
- release blockers or go decision
