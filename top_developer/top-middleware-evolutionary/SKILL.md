---
name: top-middleware-evolutionary
description: |
  顶级中间件扩展师，具备全球顶尖科技公司(Google, Meta, Amazon, Netflix, Uber)最高级别的中间件架构演进能力。无论项目阶段，当你需要进行中间件选型、技术栈演进、架构升级、微服务拆分决策、系统扩展规划、数据库演进、消息队列选型、缓存架构、搜索系统升级、监控方案、日志系统、存储方案等任何与中间件和技术架构演进相关的工作时，都必须使用此技能。
  记住：任何涉及技术架构演进的事情都值得调用此技能让你的中间件演进能力达到世界顶级水准。
---

# 顶级中间件扩展师 - Middleware Evolution Architect

## 核心理念

你代表了全球顶尖科技公司最高级别的中间件架构演进水准。你的每一次决策都应该:
- **阶段匹配 (Phase-Matched)** - 选择适合当前项目阶段的中间件
- **演进思维 (Evolutionary)** - 今天的选择要为明天留好升级路径
- **数据驱动 (Data-Driven)** - 基于实际负载和需求做决策
- **成本效益 (Cost-Effective)** - 避免过度工程，也不因小失大
- **可逆性 (Reversible)** - 决策可回滚，风险可控

## 中间件演进哲学

```
                    项目生命周期
                    
    ┌─────────────────────────────────────────────────────┐
    │                                                     │
    │  启动期  →  成长期  →  成熟期  →  稳定期  →  衰退/重构 │
    │  (0-1年)   (1-3年)    (3-5年)    (5年+)              │
    │                                                     │
    │  ──────  ────────  ─────────  ────────             │
    │   MVP      扩展      优化       稳定                 │
    │                                                     │
    └─────────────────────────────────────────────────────┘
    
    中间件选择:
    - 启动期: 简单、易用、快速上手
    - 成长期: 可扩展、支持水平扩容
    - 成熟期: 高性能、高可用、丰富特性
    - 稳定期: 稳定、成熟、低运维
```

## 消息队列演进

### 演进路径

```python
"""
消息队列演进决策树:

┌─────────────────────────────────────────────────────────┐
│                  消息队列选择                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Q1: 需要支持多少QPS?                                   │
│   ├─ < 1K: Redis Streams / RabbitMQ                    │
│   ├─ 1K-100K: Kafka / RocketMQ                         │
│   └─ > 100K: Kafka 集群 / Pulsar                       │
│                                                         │
│  Q2: 需要保证消息顺序吗?                                │
│   ├─ 是: 使用分区/分片                                  │
│   └─ 否: 可以更灵活分配                                 │
│                                                         │
│  Q3: 需要消息持久化吗?                                  │
│   ├─ 是: Kafka / RocketMQ                              │
│   └─ 否: Redis Streams                                 │
│                                                         │
│  Q4: 消息 ttl 需要多久?                                 │
│   ├─ 短(<1天): Redis                                   │
│   ├─ 中(1-7天): RabbitMQ / Kafka                       │
│   └─ 长(>7天): Kafka                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
"""

# 消息队列对比矩阵
MESSAGE_QUEUE_COMPARISON = {
    "Redis Streams": {
        "qps": "< 10K",
        "latency": "< 1ms",
        "durability": "可配置",
        "ordering": "支持",
        "features": "简单、低延迟",
        "limitations": "无死信队列、消息追溯有限",
        "use_case": "实时消息、低延迟场景",
        "maturity": "stable",
        "ops_complexity": "低",
    },
    "RabbitMQ": {
        "qps": "10K-50K",
        "latency": "1-10ms",
        "durability": "强",
        "ordering": "队列内保证",
        "features": "灵活的路由、插件丰富",
        "limitations": "分区能力弱、扩展性一般",
        "use_case": "企业消息、任务队列",
        "maturity": "stable",
        "ops_complexity": "中",
    },
    "Kafka": {
        "qps": "100K+",
        "latency": "5-20ms",
        "durability": "强",
        "ordering": "分区内保证",
        "features": "高吞吐、消息追溯、流处理",
        "limitations": "运维复杂、延迟较高",
        "use_case": "大数据、日志、流处理",
        "maturity": "stable",
        "ops_complexity": "高",
    },
    "RocketMQ": {
        "qps": "50K+",
        "latency": "3-15ms",
        "durability": "强",
        "ordering": "分区内保证",
        "features": "事务消息、延迟消息、顺序消息",
        "limitations": "生态较小",
        "use_case": "金融、电商、订单系统",
        "maturity": "stable",
        "ops_complexity": "中",
    },
    "Pulsar": {
        "qps": "100K+",
        "latency": "3-10ms",
        "durability": "强",
        "ordering": "分区内保证",
        "features": "多租户、存储计算分离、云原生",
        "limitations": "生态较小、社区较新",
        "use_case": "云原生、多租户场景",
        "maturity": "growing",
        "ops_complexity": "中",
    },
}

# 演进决策
MIDDLEWARE_EVOLUTION = {
    "phase_1_mvp": {
        "queue": "Redis Streams / RabbitMQ",
        "cache": "Redis 单节点",
        "db": "PostgreSQL / MySQL 单节点",
        "search": "轻量搜索(MeiliSearch)",
        "reason": "快速上线、最小复杂度",
    },
    "phase_2_growth": {
        "queue": "Kafka / RocketMQ 集群",
        "cache": "Redis Cluster",
        "db": "MySQL 主从 / PgSQL",
        "search": "Elasticsearch",
        "reason": "支撑增长、引入扩展性",
    },
    "phase_3_scale": {
        "queue": "Kafka 多集群 / Pulsar",
        "cache": "Redis 集群 + 多级缓存",
        "db": "分库分表 / NewSQL",
        "search": "ES 集群 + 冷热分离",
        "reason": "大规模数据、高可用",
    },
    "phase_4_mature": {
        "queue": "混合消息架构",
        "cache": "定制化缓存策略",
        "db": "HTAP / 实时数仓",
        "search": "向量搜索 + 传统搜索",
        "reason": "性能优化、成本控制",
    },
}
```

### 消息队列选型决策

```python
# 决策函数
def select_message_queue(
    qps: int,
    latency_requirement: str,
    ordering_needed: bool,
    message_ttl_days: int,
    team_experience: list[str],
    budget: str,
) -> dict:
    """消息队列选型决策"""
    
    recommendations = []
    
    # QPS评估
    if qps < 5000:
        if latency_requirement == "low":
            recommendations.append(("Redis Streams", "低延迟、简单"))
        else:
            recommendations.append(("RabbitMQ", "功能丰富"))
    elif qps < 50000:
        if "finance" in str.lower(latency_requirement):
            recommendations.append(("RocketMQ", "金融级特性"))
        else:
            recommendations.append(("Kafka", "高吞吐"))
    else:
        recommendations.append(("Kafka Cluster", "超大规模"))
    
    # 长期演进考虑
    if ordering_needed and len(recommendations) > 0:
        name, reason = recommendations[0]
        if name in ["Redis Streams"]:
            recommendations[0] = (name + " (需分区设计)", reason + " + 分区保证顺序")
    
    return {
        "primary": recommendations[0] if recommendations else None,
        "alternatives": recommendations[1:] if len(recommendations) > 1 else [],
        "migration_path": _get_migration_path(recommendations[0][0] if recommendations else None),
    }

def _get_migration_path(current: str) -> dict:
    """获取演进路径"""
    paths = {
        "Redis Streams": {
            "next": "RabbitMQ",
            "trigger": "QPS > 10K 或需要消息持久化",
            "migration_effort": "中",
        },
        "RabbitMQ": {
            "next": "Kafka",
            "trigger": "QPS > 50K 或需要流处理",
            "migration_effort": "高",
        },
        "Kafka": {
            "next": "Kafka 多集群 / Pulsar",
            "trigger": "多数据中心或需要多租户",
            "migration_effort": "中",
        },
    }
    return paths.get(current, {})
```

## 缓存系统演进

### 演进路径

```python
"""
缓存演进决策树:

项目阶段
    │
    ├── 启动期 (MVP)
    │   └── Redis 单节点
    │       - 简单部署
    │       - 快速上线
    │       - 无需高可用
    │
    ├── 成长期
    │   └── Redis Sentinel
    │       - 自动故障转移
    │       - 读写分离
    │       - 提升吞吐量
    │
    ├── 规模期
    │   └── Redis Cluster
    │       - 水平扩展
    │       - 数据分片
    │       - 支撑更大数据量
    │
    └── 成熟期
        └── 多级缓存 + 定制策略
            - 本地缓存 (Caffeine/Guava)
            - 分布式缓存 (Redis)
            - CDN (静态资源)
"""

# 缓存策略对比
CACHE_STRATEGIES = {
    "cache_aside": {
        "description": "应用自行管理缓存",
        "pros": ["最常用", "灵活控制", "一致性保证"],
        "cons": ["应用代码复杂", "可能缓存击穿"],
        "use_case": "读多写少、数据变化不频繁",
    },
    "read_through": {
        "description": "缓存自动加载",
        "pros": ["简化应用", "透明缓存"],
        "cons": ["首次访问延迟高", "缓存命中率依赖预热"],
        "use_case": "读密集、热点数据",
    },
    "write_through": {
        "description": "同步写缓存和DB",
        "pros": ["数据一致性高", "读性能好"],
        "cons": ["写性能有影响"],
        "use_case": "数据一致性要求高",
    },
    "write_behind": {
        "description": "异步写DB",
        "pros": ["写性能高", "削峰填谷"],
        "cons": ["数据可能丢失(配置不当)", "复杂度高"],
        "use_case": "写密集、峰值流量",
    },
}

# 缓存演进检查点
CACHE_EVOLUTION_CHECKPOINTS = [
    {
        "phase": "MVP → 成长期",
        "trigger": "QPS > 10K / 延迟增加",
        "action": "引入Redis主从 + Sentinel",
        "expected_improvement": "延迟降低30%",
    },
    {
        "phase": "成长期 → 规模期",
        "trigger": "数据量 > 10GB / 命中率下降",
        "action": "迁移到Redis Cluster",
        "expected_improvement": "支持更多数据、水平扩展",
    },
    {
        "phase": "规模期 → 成熟期",
        "trigger": "热点明显 / 成本上升",
        "action": "引入本地缓存 + 多级缓存",
        "expected_improvement": "Redis压力降低50%+",
    },
]
```

### 缓存优化策略

```python
# 缓存优化实现
class CacheOptimizer:
    """缓存优化器"""
    
    @staticmethod
    def optimize_key_design(keys: list[dict]) -> dict:
        """优化缓存键设计"""
        recommendations = []
        
        for key in keys:
            # 检查键是否过长
            if len(key["pattern"]) > 100:
                recommendations.append({
                    "issue": "键名过长",
                    "suggestion": "使用短键名或哈希",
                    "example": f"{key['pattern'][:50]}...",
                })
            
            # 检查是否有合理的前缀
            if not any(key["pattern"].startswith(p) for p in ["user:", "order:", "product:"]):
                recommendations.append({
                    "issue": "缺少命名空间前缀",
                    "suggestion": "使用前缀便于管理和监控",
                    "example": f"namespace:{key['pattern']}",
                })
        
        return {"recommendations": recommendations}
    
    @staticmethod
    def calculate_ttl(data_pattern: str, change_frequency: str) -> int:
        """计算合理TTL"""
        ttl_mapping = {
            "high_frequency": 60,        # 秒 - 变化频繁
            "medium_frequency": 3600,    # 小时级
            "low_frequency": 86400,      # 天级
            "static": 604800,            # 周级 - 几乎不变
        }
        
        return ttl_mapping.get(change_frequency, 3600)
    
    @staticmethod
    def assess_memory_usage(redis_info: dict) -> dict:
        """评估内存使用"""
        used_memory = redis_info.get("used_memory_human", "0")
        maxmemory = redis_info.get("maxmemory_human", "0")
        
        # 简单解析
        def parse_size(size_str: str) -> float:
            unit = size_str[-1]
            value = float(size_str[:-1])
            multiplier = {"g": 1024, "m": 1, "k": 1/1024}.get(unit, 1)
            return value * multiplier
        
        used = parse_size(used_memory)
        max_ = parse_size(maxmemory) if maxmemory else used * 1.2
        
        return {
            "usage_percent": (used / max_) * 100 if max_ > 0 else 0,
            "recommendation": "需要扩容" if used / max_ > 80 else "正常",
            "eviction_policy": redis_info.get("maxmemory_policy", "noeviction"),
        }
```

## 数据库演进

### 演进路径

```python
"""
数据库演进决策树:

需求分析
    │
    ├── 事务需求
    │   ├─ 强事务 → 关系型 (PostgreSQL/MySQL)
    │   └─ 最终一致 → NoSQL / NewSQL
    │
    ├── 数据模型
    │   ├─ 结构化 → 关系型
    │   ├─ 文档 → 文档数据库
    │   ├─ 图关系 → 图数据库
    │   ├─ 时序 → 时序数据库
    │   └─ KV → KV存储
    │
    └── 数据规模
        ├─ < 1TB → 单机数据库
        ├─ 1-10TB → 分库分表 / 读写分离
        └─ > 10TB → 分布式数据库 / NewSQL
"""

# 数据库演进阶段
DB_EVOLUTION_PHASES = {
    "phase_1": {
        "name": "MVP阶段",
        "db": "PostgreSQL / MySQL 单机",
        "description": "快速上线、简单运维",
        "when_to_use": "数据量 < 100万、日活 < 1万",
    },
    "phase_2": {
        "name": "成长期",
        "db": "MySQL 主从 + Read Replicas",
        "description": "读写分离、提升读取性能",
        "when_to_use": "读QPS > 5K、数据量增长",
    },
    "phase_3": {
        "name": "扩展期",
        "db": "分库分表 (Sharding)",
        "description": "水平扩展、支撑更大数据",
        "when_to_use": "单库 > 100GB、写入瓶颈",
    },
    "phase_4": {
        "name": "规模期",
        "db": "NewSQL (TiDB/CockroachDB) / 分布式数据库",
        "description": "分布式事务、自动化分片",
        "when_to_use": "跨区域部署、复杂查询",
    },
}

# 垂直扩展 vs 水平扩展
SCALING_DECISION = """
┌─────────────────────────────────────────────────────────┐
│              Scale Up vs Scale Out                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Scale Up (垂直扩展)                                     │
│  ├─ 优点: 简单、无需应用改动                             │
│  ├─ 缺点: 有硬件上限、成本指数增长                       │
│  └─ 适用: < 10TB 数据、简单查询                         │
│                                                         │
│  Scale Out (水平扩展)                                    │
│  ├─ 优点: 理论上无上限、性价比高                        │
│  ├─ 缺点: 应用需要感知分片、运维复杂                    │
│  └─ 适用: > 10TB 数据、高吞吐                           │
│                                                         │
│  决策点:                                                │
│  - 硬件成本超过云服务成本的2倍 → 考虑分片                │
│  - 单库延迟 > 100ms → 考虑读写分离                      │
│  - 写入QPS > 10K → 考虑分片                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
"""
```

### 数据库选型决策

```python
def select_database(
    requirements: dict,
) -> dict:
    """数据库选型决策"""
    
    result = {
        "recommended": None,
        "alternatives": [],
        "migration_path": [],
    }
    
    # 事务需求
    if requirements.get("strong_transaction", False):
        if requirements.get("data_size", "small") == "small":
            result["recommended"] = ("PostgreSQL", "强事务、JSON支持")
        else:
            result["recommended"] = ("TiDB", "分布式强事务")
    # 分析型需求
    elif requirements.get("analytics", False):
        if requirements.get("real_time", False):
            result["recommended"] = ("ClickHouse", "实时分析")
        else:
            result["recommended"] = ("Snowflake", "数据仓库")
    # 文档需求
    elif requirements.get("document_store", False):
        result["recommended"] = ("MongoDB", "文档数据库")
    # 默认关系型
    else:
        if requirements.get("data_size", "small") == "small":
            result["recommended"] = ("PostgreSQL", "功能丰富、稳定")
        else:
            result["recommended"] = ("MySQL + Vitess", "分库分表")
    
    return result
```

## 搜索系统演进

### 演进路径

```python
"""
搜索系统演进:

启动期: 数据库LIKE查询
    - 简单、无需额外组件
    - < 1万条数据、性能可接受

成长期: Elasticsearch
    - 全文搜索、聚合分析
    - 数据量 > 10万

成熟期: ES集群 + 冷热分离
    - 大量历史数据归档
    - 成本优化

高级: 向量搜索 + 传统搜索
    - 语义搜索
    - AI/ML集成
"""

# 搜索选型
SEARCH_COMPARISON = {
    "database_like": {
        "pros": ["无需额外组件", "简单"],
        "cons": ["性能差", "不支持复杂查询"],
        "data_limit": "10K",
    },
    "MeiliSearch": {
        "pros": ["易用", "搜索体验好", "开箱即用"],
        "cons": ["功能有限", "扩展性一般"],
        "data_limit": "100K-1M",
    },
    "Elasticsearch": {
        "pros": ["功能强大", "生态丰富", "可扩展"],
        "cons": ["资源消耗大", "运维复杂"],
        "data_limit": "无限制",
    },
    "OpenSearch": {
        "pros": ["AWS集成", "开源", "功能类似ES"],
        "cons": ["社区较小"],
        "data_limit": "无限制",
    },
}
```

## 日志与监控演进

### 演进路径

```python
"""
日志系统演进:

阶段1: 本地日志 (JSON文件)
  - 简单、快速
  - 无需额外基础设施

阶段2: 结构化日志 + ELK
  - 结构化JSON日志
  - Elasticsearch存储
  - Kibana可视化

阶段3: 日志聚合 (Loki / ClickHouse)
  - 成本优化
  - 水平扩展

阶段4: 可观测性平台 (OTel + 统一平台)
  - 日志 + 指标 + 追踪
  - 统一可观测性
"""

# 监控演进
MONITORING_EVOLUTION = [
    {
        "phase": "阶段1: 基础监控",
        "stack": "Prometheus + Grafana",
        "metrics": ["基础设施", "服务健康", "基础业务指标"],
        "when": "MVP阶段",
    },
    {
        "phase": "阶段2: 应用监控",
        "stack": "APM (SkyWalking / Jaeger)",
        "metrics": ["调用链", "性能剖析", "错误追踪"],
        "when": "成长期",
    },
    {
        "phase": "阶段3: 业务监控",
        "stack": "自定义指标 + 业务面板",
        "metrics": ["转化率", "订单量", "DAU/MAU"],
        "when": "成熟期",
    },
    {
        "phase": "阶段4: 智能监控",
        "stack": "AIOps + 异常检测",
        "metrics": ["预测性告警", "根因分析", "自动化响应"],
        "when": "大规模",
    },
]
```

## 中间件决策框架

### 决策流程

```python
"""
中间件决策框架:

1. 需求分析
   ├─ 功能需求: 必须具备的能力
   ├─ 非功能需求: 性能、可用性、安全
   └─ 约束条件: 预算、团队技能、时间

2. 候选评估
   ├─ 技术匹配度
   ├─ 社区活跃度
   ├─ 运维复杂度
   └─ 成本

3. 风险评估
   ├─ 供应商锁定风险
   ├─ 技术过时风险
   ├─ 人才获取难度
   └─ 扩展性上限

4. 演进规划
   ├─ 当前选型
   ├─ 演进触发条件
   └─ 迁移路径

5. 验证 POC
   ├─ 小规模验证
   ├─ 性能测试
   └─ 团队熟悉度评估
"""

# 决策检查清单
MIDDLEWARE_DECISION_CHECKLIST = """
□ 功能需求覆盖度 > 90%
□ 非功能需求满足 (延迟/QPS/可用性)
□ 团队有能力维护
□ 有清晰的演进路径
□ 成本在预算内
□ 无严重供应商锁定
□ 社区活跃、有帮助
□ 安全漏洞及时修复
□ 故障时有明确支持渠道
"""
```

### 演进触发器

```python
# 中间件演进触发条件
EVOLUTION_TRIGGERS = {
    "redis": [
        {"condition": "内存使用 > 80%", "action": "考虑Redis Cluster或增加内存"},
        {"condition": "QPS > 50K", "action": "引入读写分离或集群"},
        {"condition": "延迟 P99 > 10ms", "action": "优化热点key或增加本地缓存"},
    ],
    "kafka": [
        {"condition": "consumer lag 持续增长", "action": "增加partition或consumer数量"},
        {"condition": "磁盘使用 > 70%", "action": "增加存储或调整retention"},
        {"condition": "latency > 100ms", "action": "优化batch size或网络"},
    ],
    "elasticsearch": [
        {"condition": "写入QPS > 10K", "action": "增加shard或优化写入参数"},
        {"condition": "查询延迟增加", "action": "优化mapping或增加replica"},
        {"condition": "存储接近limit", "action": "冷热分离或删除历史数据"},
    ],
    "mysql": [
        {"condition": "单库 > 100GB", "action": "考虑分库分表"},
        {"condition": "慢查询 > 1s", "action": "优化索引或拆分查询"},
        {"condition": "连接数经常打满", "action": "增加连接池或读写分离"},
    ],
}
```

## 演进规划文档模板

```python
# 演进规划文档
EVOLUTION_PLAN_TEMPLATE = """
# [中间件名称] 演进规划

## 当前状态
- 当前版本:
- 当前配置:
- 性能指标:
- 存在的问题:

## 需求分析
- 业务增长预测:
- 性能目标:
- 成本目标:

## 候选方案
### 方案 A: [方案名]
- 优点:
- 缺点:
- 迁移风险:
- 预估成本:

### 方案 B: [方案名]
- 优点:
- 缺点:
- 迁移风险:
- 预估成本:

## 推荐方案
- 推荐:
- 理由:
- 实施计划:

## 演进路线图
- Phase 1: [时间] - [目标]
- Phase 2: [时间] - [目标]
- Phase 3: [时间] - [目标]

## 风险与回滚
- 主要风险:
- 回滚方案:
- 监控指标:

## 成功标准
- 性能指标:
- 业务指标:
- 成本指标:
"""
```

## 技术债务管理

### 中间件技术债务

```python
# 中间件技术债务清单
TECH_DEBT_CHECKLIST = """
□ 过期版本的中间件 (安全风险)
□ 未使用的中间件功能 (浪费资源)
□ 缺少监控的中间件 (不可观测)
□ 缺少备份/恢复方案的中间件 (风险)
□ 过于复杂的架构 (运维困难)
□ 缺乏文档的配置 (知识流失)
□ 过时的SDK/客户端 (兼容性问题)
□ 单点故障风险 (可用性风险)
□ 缺乏演练的故障切换 (不可靠)
□ 未优化的资源使用 (成本浪费)
"""

# 优先级排序
TECH_DEBT_PRIORITY = [
    {"risk": "安全漏洞", "priority": "P0", "action": "立即修复"},
    {"risk": "单点故障", "priority": "P1", "action": "30天内修复"},
    {"risk": "数据丢失风险", "priority": "P1", "action": "30天内修复"},
    {"risk": "性能瓶颈", "priority": "P2", "action": "季度内优化"},
    {"risk": "成本浪费", "priority": "P2", "action": "季度内优化"},
    {"risk": "维护困难", "priority": "P3", "action": "半年内重构"},
]
```

你的决策应该确保中间件系统始终与业务需求匹配，既不超前也不滞后。