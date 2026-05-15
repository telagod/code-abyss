# 数据工程详细参考

## 管道编排

| 特性 | Airflow | Dagster | Prefect |
|------|---------|---------|---------|
| 核心模型 | DAG+Task | Asset+Op | Flow+Task |
| 资产管理 | 无 | 原生 | 无 |
| 本地开发 | 复杂 | 简单 | 简单 |

Airflow：`@task` 装饰器+自动 XCom | `.expand()` 动态映射 | `retries=3, retry_exponential_backoff=True`
Dagster：`@asset(group_name, deps)` + `ConfigurableResource` + `DailyPartitionsDefinition` + `@asset_check`
Prefect：`@flow` + `@task(retries=3, cache_key_fn=task_input_hash)` + `ConcurrentTaskRunner`

## 流处理

| 特性 | Kafka Streams | Flink | Spark Streaming |
|------|---------------|-------|-----------------|
| 部署 | 嵌入式 JVM | 独立集群 | 独立集群 |
| 状态 | RocksDB | RocksDB/内存 | 内存 |
| 窗口 | 丰富 | 最丰富 | 基础 |

Kafka Streams：`StreamsBuilder` → `stream/filter/map` → `groupByKey().aggregate()` → `to()` | Join(Stream-Stream/Stream-Table) | `EXACTLY_ONCE_V2`
Flink：Tumbling/Sliding/Session 窗口 | `aggregate(AggregateFunction)` | ValueState/ListState+TTL | `enableCheckpointing(60000)` + Watermark(`forBoundedOutOfOrderness`) | 数据倾斜→随机前缀打散

## 数据质量

维度：`完整性 → 准确性 → 一致性 → 及时性 → 有效性`

| 工具 | 优势 | 适用 |
|------|------|------|
| Great Expectations | 丰富 Expectations、Data Docs | Python 生态、复杂验证 |
| dbt | SQL 原生、血缘追踪 | 数仓转换测试 |
| Soda Core | 简洁 YAML | 快速验证、CI/CD |

GE：`gx.get_context()` → 数据源 → `row_count_between`/`not_be_null`/`be_unique`/`be_between` → Checkpoints
dbt：`unique`/`not_null`/`accepted_values`/`relationships` + `dbt_expectations` + `--store-failures`
Soda：`row_count > N` / `missing_count(col) = 0` / `freshness(ts) < 1d`
