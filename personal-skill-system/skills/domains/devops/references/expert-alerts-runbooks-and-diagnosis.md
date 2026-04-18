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

## Diagnosis rules

- alerts should imply a bounded operator action
- runbooks should narrow the failure space quickly
- page-worthy alerts should be rare and high-confidence
- noisy alerts should be fixed or demoted, not culturally ignored

## Output contract

Leave behind:

- alert action
- runbook entry point
- diagnosis shortcut
- demotion or tuning advice
