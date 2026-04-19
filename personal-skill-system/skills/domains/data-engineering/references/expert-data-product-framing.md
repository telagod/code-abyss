# Expert Data Product Framing

Use this reference when the first mistake would be building a pipeline before naming the data product.

## Core rules

- start from the business question or downstream action
- freshness is a product requirement, not a default
- one metric should have one declared source of truth
- consumers and producers should be named explicitly

## Strong questions

- who will use the output and for what decision
- what lateness is acceptable
- what level of correctness is required
- what breaks if the dataset is wrong or late

## Product contract

- define decision owner and action frequency tied to this product
- define freshness SLO and acceptable stale-data window
- define correctness bar: tolerated error classes and severity mapping
- define source-of-truth boundary and conflict resolution rule

## Producer-consumer alignment

- name upstream owner for each critical input contract
- name downstream owner for each critical consumption path
- define compatibility window for schema and semantic changes
- define rollback or fallback behavior when upstream contract breaks

## Quality and trust gates

- publish only when schema, completeness, and reconciliation checks pass
- attach lineage metadata and run evidence to every release
- classify data incidents by decision impact, not only row-count drift
- enforce explicit incident owner and restoration SLO for trust loss

## Evolution policy

- version semantics when business meaning changes, not only column shape
- deprecate outputs with announced migration window and owner
- require ADR when product scope shifts from reporting to decision automation
- reassess freshness and quality SLOs when decision criticality changes

## Common framing failures

- building a pipeline before naming the consumer and decision
- treating freshness as a vanity goal instead of a business need
- allowing several sources of truth for one critical metric
- assuming data quality can be retrofitted after trust is lost
- output contract changes without notifying decision owners

## Output contract

Leave behind:

- data product name
- producer and consumer map
- freshness target
- source-of-truth statement
- correctness risk
- trust gate and incident ownership model
