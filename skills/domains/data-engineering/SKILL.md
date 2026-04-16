---
name: data-engineering
description: 数据工程。Airflow、Dagster、Kafka Streams、Flink、dbt、数据管道、流处理、数据质量。当用户提到数据管道、ETL、流处理、数据质量时路由到此。
license: MIT
user-invocable: false
disable-model-invocation: false
---

# 数据工程域 · Data Engineering

```
管道编排：Airflow(调度) | Dagster(资产) | Prefect(现代工作流)
流处理：Kafka Streams | Flink | Spark Streaming
质量保障：Great Expectations | dbt | Soda Core
```

---

## 管道编排

| 特性 | Airflow | Dagster | Prefect |
|------|---------|---------|---------|
| 核心模型 | DAG+Task | Asset+Op | Flow+Task |
| 学习曲线 | 陡峭 | 中等 | 平缓 |
| 资产管理 | 无 | 原生 | 无 |
| 本地开发 | 复杂 | 简单 | 简单 |

### Airflow

- DAG：`with DAG(dag_id, schedule, default_args) as dag`
- TaskFlow：`@task` 装饰器，自动 XCom；动态：`.expand()` mapping
- Operators：Python/Bash/SQL/HTTP/S3 | Sensors：File/Http/ExternalTask
- 容错：`retries=3, retry_exponential_backoff=True` + `on_failure_callback` + `sla=timedelta(hours=2)`

### Dagster

- Asset：`@asset(group_name, deps)` + MaterializeResult 返回元数据
- Resources：`ConfigurableResource` 管理连接
- Jobs/Schedules/Sensors：`define_asset_job` + `ScheduleDefinition` + `@sensor`
- Partitions：`DailyPartitionsDefinition` | Asset Checks：`@asset_check` 验证质量

### Prefect

`@flow` + `@task(retries=3, cache_key_fn=task_input_hash)` | `ConcurrentTaskRunner` + `task.map` | `Deployment.build_from_flow` | Blocks 管理配置密钥

### 调度 Checklist

Cron正确 | 事件驱动(S3/API触发) | 跨DAG依赖 | 幂等(UPSERT/分区覆盖) | 增量(`WHERE updated_at > last_run`) | 数据血缘(ref/Asset deps)

---

## 流处理

| 特性 | Kafka Streams | Flink | Spark Streaming |
|------|---------------|-------|-----------------|
| 部署 | 嵌入式(JVM) | 独立集群 | 独立集群 |
| 状态 | RocksDB | 内存/RocksDB | 内存 |
| Exactly-Once | 支持 | 支持 | 支持 |
| 窗口 | 丰富 | 最丰富 | 基础 |

### Kafka Streams

拓扑：`StreamsBuilder` → `stream()` → `filter/map/flatMap` → `to()`
聚合：`groupByKey().count()` / `.aggregate()` / `.reduce()`
Join：Stream-Stream(时间窗口) / Stream-Table / Table-Table
状态：`Stores.persistentKeyValueStore` + Transformer
Exactly-Once：`EXACTLY_ONCE_V2` | 调优：`NUM_STREAM_THREADS=4` / `CACHE_MAX_BYTES_BUFFERING` / RocksDB

### Flink

- DataStream：`env.addSource()` → `filter/map` → `addSink()`
- 窗口：Tumbling(`Time.minutes(5)`) | Sliding(size,slide) | Session(gap) | Global+自定义Trigger
- 聚合：`aggregate(AggregateFunction, WindowFunction)` 增量+全窗口
- ProcessFunction：低级API，时间戳+定时器
- 状态：ValueState/ListState/MapState + TTL
- Checkpoint：`enableCheckpointing(60000)` + EXACTLY_ONCE | Savepoint：`-s /path`
- 时间：Event Time + Watermark(`forBoundedOutOfOrderness`) + `allowedLateness` + `sideOutputLateData`
- 数据倾斜：随机前缀打散 key

### 流处理 Checklist

时间语义选择 | Watermark乱序容忍 | 窗口匹配业务 | 状态TTL防膨胀 | Checkpoint间隔 | 端到端Exactly-Once | 背压监控 | 并行度调优

---

## 数据质量

维度：`完整性(非空) → 准确性(范围) → 一致性(关联) → 及时性(新鲜度) → 有效性(格式)`

| 工具 | 优势 | 适用 |
|------|------|------|
| Great Expectations | 丰富Expectations、Data Docs | Python生态、复杂验证 |
| dbt | SQL原生、血缘追踪 | 数仓、转换测试 |
| Soda Core | 简洁YAML | 快速验证、CI/CD |

### Great Expectations

`gx.get_context()` → 数据源 → 批次。常用：`row_count_between` / `not_be_null` / `be_unique` / `be_between` / `be_in_set` / `match_regex`。Checkpoints 批量验证+Data Docs。自定义继承 `ColumnMapExpectation`。

### dbt 测试

Schema：`unique`/`not_null`/`accepted_values`/`relationships` | Generic：`{% test name() %}` | Singular：`tests/`下SQL返回行=失败
dbt_expectations：`expect_column_mean_to_be_between` / `expect_row_values_to_have_recent_data`
执行：`dbt test` / `--select model` / `--store-failures` | 血缘：`{{ ref() }}` + `{{ source() }}` → `dbt docs generate`

### Soda Core

```yaml
checks for table:
  - row_count > 100
  - missing_count(col) = 0
  - duplicate_count(col) = 0
  - freshness(ts_col) < 1d
```

### 质量 Checklist

分层验证(源→转换→目标) | 完整性(非空) | 准确性(范围/正则) | 一致性(跨表主键) | 及时性(<阈值) | 唯一性 | 加权评分 | 告警(Slack/Email/PagerDuty) | 定时监控

---

## 最佳实践

| 实践 | 说明 |
|------|------|
| 幂等 | UPSERT/分区覆盖，重跑无副作用 |
| 增量 | 时间戳/CDC，减少全量扫描 |
| 血缘 | dbt ref() / Dagster Asset deps |
| 分层验证 | 源→转换→目标每层验证 |
| 监控告警 | SLA+质量指标+延迟 |
| 状态管理 | TTL+Checkpoint+Savepoint |
| 容错 | 重试+死信队列+回滚 |

## 触发词

数据管道、Airflow、Dagster、Prefect、ETL、流处理、Kafka Streams、Flink、数据质量、Great Expectations、dbt、数据验证、数据血缘
