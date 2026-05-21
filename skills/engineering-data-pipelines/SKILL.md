---
name: engineering-data-pipelines
description: Data engineering knowledge reference covering Airflow, Dagster, Kafka Streams, Flink, dbt, and data quality patterns. Use when building data pipelines, ETL workflows, stream processing, or data quality checks.
user-invocable: false
---

# 数据工程域 · Data Engineering

```
编排：Airflow(调度) | Dagster(资产) | Prefect(现代流)
流处理：Kafka Streams(嵌入式) | Flink(集群) | Spark Streaming
质量：Great Expectations | dbt tests | Soda Core
```

## 编排检查项

幂等(UPSERT/分区覆盖) | 增量(`WHERE updated_at > last_run`) | 事件驱动触发 | 跨 DAG 依赖 | 数据血缘(`ref()`/Asset deps)

## 流处理检查项

时间语义选择 | Watermark 乱序容忍 | 状态 TTL 防膨胀 | Checkpoint 间隔 | 端到端 Exactly-Once | 背压监控

## 质量检查项

分层验证(源→转换→目标) | 完整性+准确性+一致性 | 及时性阈值 | 加权评分 | 告警(Slack/PagerDuty)

工具对比、API 用法、质量维度详见 [references/details.md](references/details.md)
