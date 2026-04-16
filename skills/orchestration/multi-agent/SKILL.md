---
name: multi-agent
description: 天罗秘典·多Agent协同。融合蚁群仿生设计，定义Agent角色、生命周期、信息素通信、任务分解、冲突解决。当需要多Agent并行协作时路由到此。
license: MIT
user-invocable: false
disable-model-invocation: false
---

# 天罗秘典 · 多 Agent 协同（蚁群仿生版）

> 蚁群仿生：侦察→工作→审查→修复→完成，信息素间接通信，自适应并发。

---

## 蚁群生命周期

```
目标 → Scout侦察 → 任务池 → Worker并行 → Soldier审查 → 修复 → 完成
         │                        │
         │  信息素衰减（过时自动失效） │  子任务自动产生
         └────────────────────────┘
```

| 阶段 | 角色 | 动作 | 产出 |
|------|------|------|------|
| 侦察 | Scout | 探索代码库，标记关键文件 | 任务池+依赖图 |
| 工作 | Worker | 并行执行，可生子任务 | 代码变更+进度信息素 |
| 审查 | Soldier | 审查变更，发现问题 | 修复任务/通过 |
| 修复 | Worker | 执行修复任务 | 修复后代码 |
| 完成 | Lead | 汇总报告，统一 commit | 最终交付 |

---

## Codex 原生协同协议

| 协同意图 | Codex 动作 | 约束 |
|---------|------------|------|
| 创建团队/子任务 | `spawn_agent` | 明确角色、文件所有权、完成定义 |
| 下发任务 | `send_input` | 单条消息单目标 |
| 等待完成 | `wait` | 长等待，避免忙轮询 |
| 长耗时命令 | `awaiter` agent | 测试/构建/监控必用 |
| 代码探索 | `explorer` agent | 结果视为权威，不重复检索 |
| 执行改动 | `worker` agent | 只改分配文件 |
| 收尾回收 | `close_agent` | 任务结束必关闭 |

执行顺序（不可跳步）：拆解+文件锁矩阵 → spawn → 并行+wait → reviewer审查 → 汇总+close_agent

---

## 启用决策

满足任一即启 TeamCreate：
- 涉及 ≥3 独立文件/模块
- 需 ≥2 并行工作流
- 总步骤 >10
- 魔尊明确要求并行

单一探索 → explorer；单文件操作 → worker；单步 → 直接执行。
犹豫时优先 TeamCreate，并行效率远高于串行。

---

## 角色体系（蚁群映射）

| 角色 | 蚁群映射 | 职责 | 工具权限 | 模型 |
|------|----------|------|----------|------|
| 主修 Lead | 蚁后 Queen | 分解、调度、汇总 | `spawn_agent/send_input/wait/close_agent` | 当前模型 |
| 斥候 Scout | 侦察蚁 | 只读探索，标记关键文件 | `explorer` + Read/Grep/Glob | haiku |
| 道侣 Worker | 工蚁 | 执行任务，可生子任务 | `worker` + Read/Write/Edit/Bash | sonnet |
| 护法 Soldier | 兵蚁 | 审查质量，发现问题 | `worker`(审查) + Read/Grep/Glob | sonnet |
| 走卒 Drone | 无人蚁 | 简单 bash，零 LLM 成本 | Bash | 无(execSync) |

派遣时机：了解结构→Scout；修改代码→Worker；审查→Soldier；长耗时→awaiter；短命令→Bash(Drone)。

---

## 信息素系统（Stigmergy）

以 TaskCreate metadata 模拟信息素，间接通信：

| 类型 | 释放者 | 含义 |
|------|--------|------|
| `discovery` | Scout | 代码结构、关键文件 → 助 Worker 定位 |
| `progress` | Worker | 已完成变更 → 避免冲突 |
| `warning` | Soldier | 质量问题 → 降低优先级 |
| `completion` | Worker | 任务完成 → 强化成功路径 |
| `repellent` | 任意 | 失败路径（负信息素）→ 阻止重蹈覆辙 |

决策规则：正强化(discovery/completion优先) | 负惩罚(warning降级) | 强负惩罚(repellent避免) | ε-greedy(90%按强度/10%随机)。

---

## 自适应并发

```
任务 1-2  → 1-2 Worker（直接 subagent）
任务 3-5  → TeamCreate, 2-3 Worker
任务 6-10 → TeamCreate, 3-5 Worker
任务 >10  → TeamCreate, 5-7 Worker（上限）
```

过载保护：连续失败≥2→减并发+repellent | 429限流→暂停 | 全完成→进审查 | 子任务>30→停止膨胀。

---

## 任务分解策略

按文件拆分（首选）：每 Agent 负责独立文件集，零交叉。
按模块拆分：前端/后端/基础各一 Agent。
按流水线：Scout→Worker→Soldier→Worker→Lead。
依赖感知：A import B → B 先完成，A 标 blocked。被依赖多者优先。

并行判定：不共享文件→并行 | 一读一写→先写后读 | 都写→严格串行或拆区域。

---

## 角色模板

主修（Lead）：协调全局。派 Scout 侦察 → 分配 Worker 并行 → 派 Soldier 审查 → 修复 → 汇总 commit。铁律：每文件只归一 Agent；独立任务必并行；关注信息素；全员完成方可审查；结束必 close_agent。

斥候（Scout）：只读探索。扫描结构、识别依赖、标记风险、输出 discovery 信息素。不修改任何文件。

道侣（Worker）：严格按分配文件操作，不触碰未分配文件。完成报告文件清单+行数；阻塞报告原因+建议（释放 warning）。

护法（Soldier）：审查所有变更。检查质量、安全、一致性。无问题确认通过；有问题列出+修复建议（释放 warning）。

### 强约束指令模板（Codex 可直接复用）

Worker：只允许修改 `{owned_files}`。不得跨文件；需跨域先报阻塞；完成返回改动文件+验证命令+风险点；失败返回最小复现+替代方案。

Reviewer：只读模式。按 `正确性 > 安全性 > 回归风险 > 风格` 输出问题清单。无问题写 `no findings`。

Lead 汇总：已完成项 / 阻塞项 / 剩余风险 / 下一步（可执行命令）。

---

## 通信协议

| 类型 | 格式 |
|------|------|
| message | `{type:"message", recipient, content, summary:"5字"}` |
| broadcast | `{type:"broadcast", content, summary:"5字"}` |
| shutdown | `{type:"shutdown_request", recipient, content:"原因"}` |

通信时机：Scout完成→主修(文件+依赖+discovery) | 主修→道侣(文件+要求+信息素) | 道侣完成→主修(文件+验证) | 道侣阻塞→主修(原因+warning) | 护法完成→主修(通过/问题) | 主修→全体(broadcast汇总)。

---

## 文件锁定与冲突

黄金规则：每文件同一时刻只许一 Agent 修改。

锁定策略：分配时锁定 → 声明式锁定 → 冲突检测(无重叠方启动) → 依赖感知(A import B 不可同时改)。

| 冲突类型 | 解决 |
|----------|------|
| 双写同文件 | 串行，先完成者先写 |
| 内容矛盾 | 主修裁决，以业务逻辑为准 |
| 依赖未就绪 | 标 blocked，主修协调 |
| 循环依赖 | repellent 信息素，主修手动拆解 |

---

## 错误处理

道侣失败 → repellent → 报主修 → 可重试(≤2次) / 换策略(参考repellent) / 不可恢复(主修接管)。
通信超时 → 等30s → 重发 → 仍无响应 → 标异常重分配。
降级：多 Agent 失败 → 降为单 Agent 串行。宁慢不错。

---

## 结果汇总

流程：收集完成报告 → 护法审查(变更>3文件时建议) → 修复 → 验证完整性+一致性 → `git add -A && git commit` → 汇总报告。

道侣不单独 commit，主修统一提交，Co-authored-by 标注各 Agent。

```
天罗收阵！
【阵法】{团队} 【阵员】{Worker}道侣+{Scout}斥候+{Soldier}护法
【信息素】discovery:{n} completion:{n} warning:{n} repellent:{n}
【战果】Agent-A:{文件}文件{行}行 | Agent-B:...
【验证】文件存在✓ 交叉引用✓ 【耗时】{t}
```

---
