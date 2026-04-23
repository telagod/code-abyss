# Expert Reliability And HA

Use this reference when the architecture must be judged by failure behavior, not only happy-path structure.

## Reliability controls

Name concrete controls:

- timeout
- retry with bounded backoff
- idempotency
- circuit breaker
- bulkhead or isolation
- rate limiting
- queue buffering
- fallback or graceful degradation
- readiness and liveness gates

## HA and DR questions

- active-active or active-standby
- RPO and RTO
- failover trigger
- replication mode
- blast radius by region or cell

## Validation

Use:

- load test
- spike test
- soak test
- failure injection where justified

## Strong output

Leave behind:

- failure modes
- control set
- HA shape
- DR stance
- success signals

