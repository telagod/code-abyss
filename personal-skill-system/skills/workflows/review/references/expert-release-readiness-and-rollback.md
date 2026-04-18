# Expert Release Readiness And Rollback

Use this reference when review must judge whether the change is actually ready to land or release.

## Core rules

- rollout safety belongs in review when deploy risk is real
- rollback posture should be explicit before approval
- config, migration, and runtime behavior changes deserve release notes or operator notes

## Strong questions

- what blocks safe release
- how rollback would actually happen
- what operator evidence will confirm health after deploy

## Output contract

Leave behind:

- release blocker or readiness judgement
- rollback stance
- operator confidence note

