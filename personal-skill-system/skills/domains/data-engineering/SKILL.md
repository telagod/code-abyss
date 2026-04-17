---
schema-version: 2
name: data-engineering
title: 数据工程知识域
description: 数据工程知识索引，覆盖数据管道、ETL、流处理、数据建模、数据质量与批流一体决策。
kind: domain
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [数据工程, etl, 数据管道, 流处理, kafka, flink, dbt]
negative-keywords: [纯ui, 纯移动端界面]
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

## Output Expectations

- identify the data product or business question first
- map producer, transform, storage, and consumer boundaries
- call out idempotency, replay, and late-data behavior explicitly
- specify where quality gates live
