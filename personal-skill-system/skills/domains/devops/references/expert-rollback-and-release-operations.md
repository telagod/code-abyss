# Expert Rollback And Release Operations

Use this reference when the hard part is operating the release safely after gates are passed.

## Core rules

- rollback should be concrete, rehearsable, and fast enough for the blast radius
- deploy notes should mention operator-relevant impact, not just user-facing features
- release ownership should remain clear through deploy, observe, and revert stages
- partial rollout and staged promotion are first-class tools, not signs of weakness

## Strong questions

- how rollback actually happens
- what operator watches immediately after deploy
- what triggers pause, revert, or continue
- whether release notes are sufficient for on-call response

## Operating rules

- rollback should be faster than the damage window for the release class
- staged rollout is a first-class control, not an admission of weakness
- release ownership should remain clear through deploy, observe, and revert
- operator-facing notes should mention impact, rollback, and new failure modes

## Output contract

Leave behind:

- rollout sequence
- rollback path
- operator watchpoints
- stop or revert trigger
