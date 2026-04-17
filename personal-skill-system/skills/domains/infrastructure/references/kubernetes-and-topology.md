# Kubernetes And Topology / Kubernetes 与部署拓扑

## 1. Start With Workload Shape

Before talking about cluster design, define:

- request pattern
- statefulness
- latency sensitivity
- scaling axis
- failure blast radius

Without this, topology discussion is guesswork.

## 2. Common Topology Questions

- one cluster or many
- namespace boundary or cluster boundary
- shared platform or isolated tenancy
- ingress split by app or by environment
- state inside cluster or managed external services

## 3. Practical Defaults

- use namespaces for soft isolation
- use separate clusters for hard compliance or blast-radius needs
- keep stateful systems external unless there is a strong reason not to
- document node pools by workload type, not by whim

## 4. Release Strategy

Choose explicitly:

- rolling
- blue/green
- canary
- shadow

And pair it with:

- health checks
- abort condition
- rollback trigger
- observability signal

## 5. Review Questions

- what fails when a node pool degrades
- what is the tenant isolation boundary
- how is ingress segmented
- what is the blast radius of a bad deployment
- what state survives cluster replacement
