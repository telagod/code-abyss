# Data Quality And Contracts / 数据质量与契约

## 1. Quality Is A Control Layer

Do not treat data quality as a BI concern only.

Quality checks belong in:

- ingestion
- transformation boundaries
- publish boundaries
- metric certification

## 2. Contract First

A data contract should answer:

- who produces the data
- who consumes it
- required fields
- allowed nullability
- key semantics
- freshness expectation
- deprecation process

If the only contract is “look at the table,” the contract is missing.

## 3. Quality Dimensions

- completeness
- uniqueness
- validity
- freshness
- consistency
- reconciliation

Each important dataset should state which dimensions are enforced and where.

## 4. Failure Handling

- warn-only for non-critical drift
- block publish for critical invariants
- quarantine malformed records when partial progress is acceptable
- page humans only for business-relevant breaches

## 5. Metric Trust

When a number is used in decision-making, define:

- owner
- computation grain
- source tables
- freshness SLA
- reconciliation rule
- acceptable error window

## 6. Review Questions

- what breaks if a column changes type
- how is freshness measured
- what is the rollback plan for a bad data release
- who owns contract changes
- what downstream consumers are affected by drift
