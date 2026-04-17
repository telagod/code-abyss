# Observability And Incident Readiness / 可观测性与事故准备

## 1. Observability Must Answer Questions

Logs, metrics, and traces are useful only if they answer:

- what failed
- when it started
- who is affected
- which dependency is involved
- what changed recently

## 2. Minimal Signals

- service health
- latency percentiles
- error rate
- saturation
- key business counters

## 3. Incident Readiness

- owner on call
- runbook for high-severity paths
- alert thresholds tied to user harm
- rollback or mitigation steps

## 4. Review Questions

- can the team localize failure in minutes
- are alerts actionable
- is there a runbook for the top failure modes
