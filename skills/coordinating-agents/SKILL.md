---
name: coordinating-agents
description: 天罗秘典·多Agent协同。融合蚁群仿生设计，定义Agent角色、生命周期、信息素通信、任务分解、冲突解决。当需要多Agent并行协作时路由到此。
license: MIT
user-invocable: false
disable-model-invocation: false
---

# 天罗秘典 · 多 Agent 协同

> 蚁群仿生：Scout 侦察 → Worker 并行 → Soldier 审查 → 修复 → Lead 汇总

## 生命周期

```
目标 → Scout侦察(discovery信息素) → 任务池 → Worker并行(progress) → Soldier审查 → 修复 → Lead统一commit
```

## 启用决策

启用 TeamCreate：涉及>=3 独立文件 | 需>=2 并行流 | 总步骤>10 | 魔尊明确要求
单一探索→explorer | 单文件→worker | 单步→直接执行。犹豫时优先 TeamCreate。

## 核心规则

- **文件锁**：每文件同一时刻只许一 Agent 修改，分配时锁定
- **并行判定**：不共享文件→并行 | 一读一写→先写后读 | 都写→串行
- **依赖感知**：A import B → B 先完成；被依赖多者优先
- **过载保护**：连续失败>=2→减并发 | 429→暂停 | 子任务>30→停止膨胀
- **降级**：多 Agent 失败 → 降为单 Agent 串行。宁慢不错

角色定义、信息素协议、指令模板、收阵报告详见 [references/protocol.md](references/protocol.md)
