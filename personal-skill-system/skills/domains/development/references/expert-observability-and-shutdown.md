# Expert Observability And Shutdown

Use this reference when production hardening depends on operator visibility and graceful lifecycle behavior.

## Core rules

- logs should explain enough to diagnose without exposing secrets
- metrics belong near critical boundaries and saturation points
- background workers must drain or fail predictably on shutdown
- health endpoints should reflect readiness, not wishful thinking

## Strong questions

- what operators can see when the path degrades
- which metrics define healthy behavior
- how shutdown affects in-flight work
- what happens to retries, queues, and worker drains on exit

## Telemetry baseline

- logs: request correlation id, boundary decisions, and failure reason taxonomy
- metrics: latency, error rate, saturation, and queue depth at service boundaries
- traces: cross-service causal chain for high-risk request classes
- events: deploy, config flip, and failover markers for timeline reconstruction

## Health semantics

- liveness should answer "process alive", not dependency readiness
- readiness should fail fast when required dependencies cannot serve safely
- startup probes should protect cold-start initialization from false restarts
- degraded mode should expose partial readiness explicitly

## Graceful shutdown choreography

- stop accepting new work before draining existing workloads
- bound drain duration with explicit timeout and fallback policy
- persist or requeue recoverable in-flight work before process exit
- emit terminal shutdown signal so operators know drain result

## Reliability drills

- test shutdown during peak load and queue backlog
- test dependency brownout while readiness is flapping
- test retry storms and confirm observability signals remain actionable
- test log and metric survivability during abrupt termination paths

## Approval bar

- critical path has one clear diagnosis path from alert to root-cause candidate
- shutdown behavior preserves correctness for in-flight work or explicitly drops with signal
- readiness and liveness semantics match real dependency and load behavior
- on-call can execute first 10 minutes of incident response from runbook alone

## Anti-patterns

- health endpoint always returns success while dependencies fail
- logs carry stack traces but no request context for correlation
- shutdown waits forever because drain timeout is undefined
- retries continue on exit path, causing duplicate side effects

## Output contract

Leave behind:

- observability plan
- health and readiness stance
- shutdown behavior
- operator blind spots
- drill scenarios and expected signals
