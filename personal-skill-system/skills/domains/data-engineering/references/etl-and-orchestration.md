# ETL And Orchestration / ETL 与编排

## 1. Core Model

Think of a data pipeline as four layers:

1. ingest
2. normalize
3. transform
4. publish

Do not collapse all four into one opaque job unless the system is tiny.

## 2. Preferred Design Rules

- make every step idempotent
- persist enough metadata to replay safely
- separate business transformation from transport concerns
- prefer append-only raw landing zones before destructive normalization
- make backfill strategy explicit before production launch

## 3. Orchestration Decisions

Use a scheduler or DAG engine when:

- dependencies matter
- retries must be policy-driven
- partial reruns are common
- lineage or auditability matters

Avoid over-orchestration when:

- the task is a single deterministic import
- scheduling and retry can be expressed locally
- there is no operational team to maintain a DAG system

## 4. Retry And Failure Strategy

- transient failure: retry with bounded backoff
- deterministic bad input: quarantine, do not infinite-retry
- partial publish risk: use staging tables or publish markers
- downstream fan-out: publish only after validation passes

## 5. Backfill Rules

Before any backfill, define:

- time range
- source of truth
- deduplication rule
- overwrite vs append behavior
- downstream recalculation scope

If these are unclear, you are not ready to backfill.

## 6. Minimal Review Checklist

- where does raw data land
- what is the stable primary key
- what makes the run idempotent
- what happens on rerun
- how are failed rows isolated
- where is success/failure reported
