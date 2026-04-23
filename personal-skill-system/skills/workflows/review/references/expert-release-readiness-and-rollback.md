# Expert Release Readiness And Rollback

Use this reference when review must judge whether the change is actually ready to land or release.

## Core rules

- rollout safety belongs in review when deploy risk is real
- rollback posture should be explicit before approval
- config, migration, and runtime behavior changes deserve release notes or operator notes
- no-go decisions are valid outcomes when uncertainty exceeds risk tolerance

## Strong questions

- what blocks safe release
- how rollback would actually happen
- what operator evidence will confirm health after deploy
- what unknowns remain after tests and static checks

## Readiness checks

- correctness evidence for changed behavior on the highest-risk paths
- operational evidence for alerting, watchpoints, and runbook updates
- compatibility evidence for schema, config, and dependency transitions
- blast-radius evidence for rollout stage design and abort mechanics

## Blocker rules

- block when rollback commands, owner, or data posture are undefined
- block when migration or config risk exists without staged rollout plan
- block when critical-path observability is missing for post-release verification
- warn when evidence exists but confidence depends on unverified assumptions

## Rollback judgement

- classify rollback as fast, constrained, or forward-fix only
- name prerequisite state needed before rollback can start
- name irreversible side effects introduced by the change
- name maximum tolerable exposure window before revert must begin

## Anti-patterns

- "tests passed" used as sole release-readiness argument
- rollback described as "re-deploy previous build" despite schema drift
- operator runbook updated after merge as a follow-up task
- release approval without explicit watch window or decision owner

## Output contract

Leave behind:

- release blocker or readiness judgement
- rollback stance
- operator confidence note
- unresolved uncertainty list with owner
