# Expert Alerts, Runbooks, And Diagnosis

Use this reference when the problem is not data collection but operational response quality.

## Core rules

- alerts should imply an action, not only a graph
- runbooks should shorten diagnosis, not restate dashboards
- diagnosis speed depends on narrowing failure space fast
- noisy alerts train teams to distrust real incidents

## Strong questions

- what action each alert expects
- what the runbook proves or rules out first
- whether diagnosis is blocked by missing context
- which alerts should page and which should log

## Alert classes

- page-now: high-confidence, user-impacting, and time-sensitive incidents
- ticket-fast: important degradation that needs bounded follow-up
- observe-only: trend or anomaly for planning, not immediate response

## Diagnosis rules

- alerts should imply a bounded operator action
- runbooks should narrow the failure space quickly
- page-worthy alerts should be rare and high-confidence
- noisy alerts should be fixed or demoted, not culturally ignored

## Runbook structure

- entry signal: what fired and why this matters now
- first triage split: likely failure classes and immediate discriminator checks
- safe actions: actions that reduce risk before deep diagnosis
- escalation path: handoff criteria and required context package

## Signal quality controls

- track alert precision, recall proxy, and mean time to acknowledge
- track repeated false-positive signatures and auto-demote candidates
- map each page alert to clear SLO or user-impact objective
- reject alerts without owner, action, and verified runbook link

## Anti-patterns

- paging on every threshold crossing without rate or duration guards
- runbook that starts with "check dashboards" and no discriminators
- diagnosis steps requiring tribal knowledge not documented in the runbook
- alert tuned by muting instead of fixing predicate quality

## Output contract

Leave behind:

- alert action
- runbook entry point
- diagnosis shortcut
- demotion or tuning advice
- signal-quality metric to watch
