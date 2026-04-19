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

## Release classes

- low-risk release: stateless change, no schema transition, fast rollback path proven
- medium-risk release: behavior change with moderate traffic impact or config coupling
- high-risk release: migration, state transition, or control-plane impact across services

## Operating rules

- rollback should be faster than the damage window for the release class
- staged rollout is a first-class control, not an admission of weakness
- release ownership should remain clear through deploy, observe, and revert
- operator-facing notes should mention impact, rollback, and new failure modes
- promotion between rollout stages should require explicit health evidence

## Stop or revert triggers

- error-rate or saturation breaches sustained over the defined watch window
- latency regression crossing user-visible thresholds for critical endpoints
- queue depth, consumer lag, or retry storm indicating recovery is not converging
- unexpected data-correctness signal degradation after migration or flag flip

## Rollback posture checks

- artifact rollback path is explicit: previous image, config, and flag state
- data rollback or forward-fix posture is explicit when schema changed
- operator command path is documented and tested by someone other than author
- rollback dry-run cadence exists for high-risk release classes

## Anti-patterns

- release approved with "we can always hotfix later"
- rollback narrative exists but executable commands and owners do not
- canary stage skipped under schedule pressure without risk downgrade
- operator notes list features but omit failure signals and stop criteria

## Output contract

Leave behind:

- rollout sequence
- rollback path
- operator watchpoints
- stop or revert trigger
- release owner and decision authority at each stage
