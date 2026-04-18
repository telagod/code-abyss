---
schema-version: 2
name: data-engineering
title: Data Engineering Domain
description: Data pipelines, ETL, streaming, contracts, and data quality. Use when the task is about pipelines, batch or stream processing, dbt, Flink, Kafka, or analytics data movement.
kind: domain
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [etl, data pipeline, streaming, flink, kafka, dbt]
negative-keywords: [ui, visual design]
priority: 74
runtime: knowledge
executor: none
permissions: [Read]
risk-level: medium
supported-hosts: [codex, claude, gemini]
status: stable
owner: self
last-reviewed: 2026-04-17
review-cycle-days: 60
tags: [domain, data]
aliases: [data-pipeline]
---

# Data Engineering Domain

## Use This When

- the task is data ingestion, transformation, orchestration, or quality
- the user asks about ETL, streaming, warehouse modeling, or pipeline reliability

## Quick Judgement

- batch first if latency is not a business requirement
- stream only when freshness materially changes the product or control loop
- data quality is part of the pipeline, not a later dashboard concern
- contracts beat tribal knowledge

## Read These References

- `references/etl-and-orchestration.md`
  Read when designing ingestion layers, DAGs, retry semantics, or backfills.
- `references/streaming-and-state.md`
  Read when evaluating Kafka/Flink style streaming, windowing, replay, or exactly-once claims.
- `references/data-quality-and-contracts.md`
  Read when the problem is schema drift, bad upstream data, reconciliation, or trust in metrics.
- `references/expert-data-product-framing.md`
  Read when the first mistake would be building the pipeline before naming the data product.
- `references/expert-batch-and-orchestration.md`
  Read when dependable scheduled flow, retry design, or backfill strategy are the hard parts.
- `references/expert-streaming-and-state.md`
  Read when real-time processing, state, event time, or replay semantics dominate the design.
- `references/expert-contracts-quality-and-reconciliation.md`
  Read when trust, data contracts, quality gates, or reconciliation drive the system design.
- `references/expert-operating-principles.md`
  Read when you want the compact expert index that routes into the split data modules.

## Output Expectations

- identify the data product or business question first
- map producer, transform, storage, and consumer boundaries
- call out idempotency, replay, and late-data behavior explicitly
- specify where quality gates live
