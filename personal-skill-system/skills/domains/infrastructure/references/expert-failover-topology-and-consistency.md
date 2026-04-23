# Expert Failover Topology And Consistency

Use this reference when multi-region or DR design is constrained by consistency and failover shape.

## Core rules

- failover topology should match business tolerance, not only infrastructure possibility
- replication mode implies consistency tradeoffs that should be visible
- active-active and active-standby create different operator and data risks
- DR posture is incomplete until cutover and rollback are explicit

## Strong questions

- what consistency degrades during failover
- how traffic shifts between regions or sites
- what split-brain or stale-data risks appear
- what business function cannot tolerate the topology

## Topology choice guide

- active-standby: simplest correctness story, slower promotion, tighter runbook dependence
- warm-standby: faster recovery, higher drift risk if readiness checks are weak
- active-active: best availability envelope, hardest conflict and convergence semantics

## Consistency envelope

- name RTO and RPO targets per business function rather than per cluster
- name write consistency mode for normal and failover states
- name accepted degradation window for stale reads and duplicate writes
- name data classes that cannot accept asynchronous loss

## Topology rules

- failover design should match business tolerance rather than infrastructure ego
- active-active and active-standby imply different consistency and operator costs
- replication mode should be explicit in every serious DR conversation
- stale-data and split-brain risks should be named before declaring resilience

## Cutover and rollback choreography

- define who authorizes failover and who executes technical cutover
- define traffic-shift sequence with abort points between phases
- define rollback path to primary once incident stabilizes
- define post-failover reconciliation steps before declaring steady state

## Split-brain and drift controls

- enforce single-writer guarantees or explicit conflict-resolution semantics
- gate promotion on replication lag, quorum state, and dependency health
- isolate control-plane mutations during unstable consensus windows
- require reconciliation evidence before re-enabling bidirectional writes

## Anti-patterns

- "multi-region" claim without workload-level RTO and RPO commitments
- active-active declared without conflict model or convergence tests
- failover drill done once with no periodic rerun
- rollback path omitted because failover is assumed one-way

## Output contract

Leave behind:

- failover topology
- consistency tradeoff
- traffic shift model
- unacceptable business impact
- cutover and rollback command ownership
