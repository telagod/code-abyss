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

## Output contract

Leave behind:

- observability plan
- health and readiness stance
- shutdown behavior
- operator blind spots

