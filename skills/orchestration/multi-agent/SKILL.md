---
name: multi-agent
description: 天罗秘典·多Agent协同。融合蚁群仿生设计，定义Agent角色、生命周期、信息素通信、任务分解、冲突解决。当需要多Agent并行协作时路由到此。
license: MIT
user-invocable: false
disable-model-invocation: false
---

# 🕸 天罗秘典 · 多 Agent 协同（蚁群仿生版）

> 参考蚁群仿生架构：侦察→工作→审查→修复→完成，信息素间接通信，自适应并发。

---

## 蚁群生命周期

所有多 Agent 协同任务遵循统一生命周期：

```
目标 → 侦察(Scout) → 任务池 → 工蚁(Worker)并行执行 → 兵蚁(Soldier)审查 → 修复(如需) → 完成
         │                           │
         │  信息素衰减（过时信息自动失效）  │  子任务自动产生
         └───────────────────────────┘
```

### 阶段定义

| 阶段 | 角色 | 动作 | 产出 |
|------|------|------|------|
| 🔍 侦察 | Scout | 探索代码库，标记关键文件和依赖 | 任务池 + 依赖图 |
| ⚒️ 工作 | Worker | 并行执行任务，可产生子任务 | 代码变更 + 进度信息素 |
| 🛡️ 审查 | Soldier | 审查所有变更，发现问题 | 修复任务 / 通过 |
| 🔧 修复 | Worker | 执行审查产生的修复任务 | 修复后的代码 |
| ✅ 完成 | Lead | 汇总报告，统一 commit | 最终交付 |

---

## Codex 原生协同协议（强化）

在 Codex CLI 中，TeamCreate/Task 抽象统一映射到以下原生动作：

| 协同意图 | Codex 动作 | 约束 |
|---------|------------|------|
| 创建团队/子任务 | `spawn_agent` | 明确角色、文件所有权、完成定义 |
| 下发任务/追问 | `send_input` | 单条消息只包含一个目标动作 |
| 等待完成 | `wait` | 优先长等待，避免忙轮询 |
| 长耗时命令 | `awaiter` agent | 测试/构建/监控必须用 awaiter |
| 代码探索 | `explorer` agent | 探索结果视为权威，不重复检索 |
| 执行改动 | `worker` agent | 明确“只改分配文件” |
| 收尾回收 | `close_agent` | 任务结束必须关闭子 Agent |

### 执行顺序（不可跳步）

```
1. 拆解任务 + 文件锁定矩阵
2. spawn explorer/worker/awaiter
3. 并行执行 + wait 收敛
4. reviewer 审查 + 必要修复
5. 汇总结果 + close_agent 全量回收
```

---

## 何时启用多 Agent

### TeamCreate vs Task(subagent) 决策树

```
收到任务 → 评估规模
  │
  ├─ 涉及 ≥3 个独立文件/模块？ → TeamCreate
  ├─ 需要 ≥2 个并行工作流？   → TeamCreate
  ├─ 总步骤 >10 步？          → TeamCreate
  ├─ 魔尊明确要求并行/团队？   → TeamCreate
  │
  ├─ 单一探索/搜索任务？       → explorer agent
  ├─ 单文件独立操作？          → worker agent
  └─ 简单查询/单步操作？       → 直接执行
```

**铁律**：当犹豫时，优先 TeamCreate。多 Agent 并行效率远高于串行 subagent。

满足**任意 1 条**即启用 TeamCreate：

| 条件 | 说明 | 示例 |
|------|------|------|
| 多文件独立变更 | ≥3 个无交叉依赖的文件 | 6 个新秘典各自独立 |
| 可并行子任务 | ≥2 个无数据依赖的工作流 | 前端+后端+文档 |
| 复杂度高 | 单 Agent 需 >10 步 | 全栈重构 |
| 时间紧迫 | 劫钟催命，需加速 | 紧急修复多服务 |

---

## 角色体系（蚁群映射）

| 角色 | 蚁群映射 | 道语 | 职责 | 工具权限 | 模型建议 |
|------|----------|------|------|----------|----------|
| 主修 (Lead) | 蚁后 Queen | 天罗主修 | 任务分解、调度、汇总 | `spawn_agent/send_input/wait/close_agent` | 当前模型 |
| 斥候 (Scout) | 侦察蚁 Scout | 天罗斥候 | 只读探索，标记关键文件 | `explorer` + Read/Grep/Glob（只读） | haiku（快速低成本） |
| 道侣 (Worker) | 工蚁 Worker | 天罗道侣 | 执行任务，可产生子任务 | `worker` + Read/Write/Edit/Bash | sonnet/当前模型 |
| 护法 (Soldier) | 兵蚁 Soldier | 天罗护法 | 审查质量，发现问题 | `worker`(审查模式) + Read/Grep/Glob（只读） | sonnet |
| 走卒 (Drone) | 无人蚁 Drone | 天罗走卒 | 简单 bash 命令，零 LLM 成本 | Bash（仅此一个） | 无（execSync） |

### 角色使用时机

```
需要了解代码库结构？ → 派 Scout（agent_type=explorer）
需要修改代码？       → 派 Worker（agent_type=worker）
需要审查变更？       → 派 Soldier（agent_type=worker，审查提示词）
需要长耗时命令？      → 派 awaiter（agent_type=awaiter）
需要短命令？         → 直接 Bash（Drone 等价）
```

---

## 信息素系统（Stigmergy）

蚁群通过信息素间接通信，而非直接对话。在 Claude Code 中，用 **TaskCreate metadata** 模拟信息素：

### 信息素类型

| 类型 | 释放者 | 含义 | 用途 |
|------|--------|------|------|
| `discovery` | Scout | 发现的代码结构、关键文件 | 帮助 Worker 快速定位 |
| `progress` | Worker | 完成的变更、修改的文件 | 帮助后续 Worker 避免冲突 |
| `warning` | Soldier | 质量问题、冲突风险 | 降低相关任务优先级 |
| `completion` | Worker | 任务完成标记 | 强化成功路径 |
| `repellent` | 任意 | 失败路径标记（负信息素） | 阻止后续 Agent 走同一条死路 |

### 实现方式

```
# Scout 完成后，在 TaskUpdate 的 metadata 中记录发现
TaskUpdate(taskId, metadata: {
  pheromone: "discovery",
  files: ["src/auth.ts", "src/middleware.ts"],
  content: "认证模块依赖 middleware，需先改 middleware"
})

# Worker 失败后，释放负信息素
TaskUpdate(taskId, metadata: {
  pheromone: "repellent",
  files: ["src/legacy.ts"],
  content: "此文件有循环依赖，直接修改会崩溃"
})
```

### 信息素决策规则

| 规则 | 说明 |
|------|------|
| **正强化** | discovery/completion 信息素的文件 → 优先分配 |
| **负惩罚** | warning 信息素的文件 → 降低优先级 |
| **强负惩罚** | repellent 信息素的文件 → 避免分配，需主修评估 |
| **ε-greedy** | 90% 按信息素强度选任务，10% 随机选 → 避免全挤同一条路 |

---

## 自适应并发

根据任务数量和复杂度动态调整 Agent 数量：

```
任务数 1-2   → 1-2 个 Worker（直接 Task subagent）
任务数 3-5   → TeamCreate, 2-3 个 Worker
任务数 6-10  → TeamCreate, 3-5 个 Worker
任务数 >10   → TeamCreate, 5-7 个 Worker（上限）
```

### 过载保护

| 信号 | 动作 |
|------|------|
| Agent 连续失败 ≥2 次 | 减少并发，释放 repellent 信息素 |
| 429 限流 | 暂停派发，等待恢复后继续 |
| 所有任务完成 | 立即进入审查阶段 |
| 子任务膨胀 >30 | 停止产生新子任务，先完成现有 |

---

## TeamCreate 最佳实践

### 命名规范

```yaml
team_name: "{项目}-{任务类型}"  # 如 "abyss-skill-expansion"
agent_type: "{角色}"            # 如 "lead", "developer", "reviewer"
description: "一句话说明团队目标"
```

---

## 任务分解策略

### 按文件拆分（首选）

每个 Agent 负责独立的文件集合，零交叉：

```
Agent-A: [file1.md, file2.md]  — 互不干涉
Agent-B: [file3.md, file4.md]  — 互不干涉
Agent-C: [file5.md]            — 互不干涉
```

### 按模块拆分

每个 Agent 负责一个功能模块：

```
Agent-前端: src/components/
Agent-后端: src/api/
Agent-基础: src/lib/
```

### 按流水线拆分（蚁群生命周期）

```
Scout(侦察) → Worker(执行) → Soldier(审查) → Worker(修复) → Lead(汇总)
```

### 依赖感知调度

分配任务前，分析文件依赖关系：

```
文件A import 文件B？
  ├─ 是 → B 的任务必须先完成，A 的任务标记 blocked
  └─ 否 → 可并行
```

**依赖深度优先**：被更多文件依赖的（底层模块）优先处理。

---

## 并行 vs 串行决策

```
子任务A 和 B 是否共享文件？
  ├─ 否 → 并行执行
  └─ 是 → 是否写同一文件？
       ├─ 否（一读一写）→ 先写后读，串行
       └─ 是（都写）→ 严格串行，或拆分文件区域
```

---

## Agent 角色模板

### 主修（Lead / Queen）启动模板

```
你是天罗主修（蚁后），负责协调多 Agent 协同任务。

生命周期：
1. 侦察阶段：派 Scout 探索代码库
2. 工作阶段：根据侦察结果分配 Worker 并行执行
3. 审查阶段：派 Soldier 审查所有变更
4. 修复阶段：如有问题，派 Worker 修复
5. 汇总阶段：收集结果，统一 commit

铁律：
- 每个文件只能分配给一个 Agent
- 独立任务必须并行启动
- 关注信息素：discovery 优先分配，repellent 避免分配
- 收到所有道侣完成消息后才能进入审查
- 所有子 Agent 完成后必须 close_agent 回收
```

### 斥候（Scout）启动模板

```
你是天罗斥候（侦察蚁），负责探索代码库。

职责：
1. 快速扫描项目结构和关键文件
2. 识别文件间的依赖关系
3. 标记需要修改的文件和潜在风险
4. 输出发现（discovery 信息素）

限制：只读操作，不修改任何文件。
```

### 道侣（Worker）启动模板

```
你是天罗道侣（工蚁），负责执行分配的子任务。

职责：
1. 严格按照分配的文件列表操作
2. 不触碰未分配的文件
3. 完成后通过 SendMessage 报告主修
4. 遇阻时立即报告，不自行扩大范围

报告格式：
- 完成：列出创建/修改的文件 + 行数
- 阻塞：说明原因 + 建议方案（释放 warning 信息素）
```

### 护法（Soldier）启动模板

```
你是天罗护法（兵蚁），负责审查所有变更。

职责：
1. 审查所有 Worker 的变更
2. 检查代码质量、安全性、一致性
3. 发现问题则生成修复任务
4. 无问题则确认通过

输出：
- 通过：确认所有变更合格
- 问题：列出问题 + 修复建议（释放 warning 信息素）
```

---

## 强约束提示词模板（可直接复用）

### Worker 指令模板（Codex）

```text
你是执行 Agent，当前任务只允许修改以下文件：
{owned_files}

硬性约束：
1) 不得修改未分配文件。
2) 若必须跨文件修改，先报告阻塞，不得自行扩域。
3) 完成后返回：改动文件、验证命令、风险点。
4) 若失败，返回最小复现与替代方案。
```

### Reviewer 指令模板（Codex）

```text
你是审查 Agent，只读模式。
请按“正确性 > 安全性 > 回归风险 > 风格”输出问题清单。
若无问题，明确写“no findings”。
```

### Lead 汇总模板（Codex）

```text
汇总每个子 Agent 的结果，给出：
1) 已完成项
2) 阻塞项
3) 剩余风险
4) 下一步（可执行命令）
```

---

## 通信协议

### SendMessage 规范

| 类型 | 用途 | 格式 |
|------|------|------|
| message | 点对点通信 | `{type: "message", recipient: "agent-name", content: "...", summary: "5字摘要"}` |
| broadcast | 全体通知 | `{type: "broadcast", content: "...", summary: "5字摘要"}` |
| shutdown_request | 请求关闭 | `{type: "shutdown_request", recipient: "agent-name", content: "原因"}` |

### 通信时机

| 事件 | 发送者 | 接收者 | 内容 |
|------|--------|--------|------|
| 侦察完成 | Scout | 主修 | 文件清单 + 依赖图 + discovery 信息素 |
| 任务分配 | 主修 | 道侣 | 文件列表 + 要求 + 相关信息素 |
| 任务完成 | 道侣 | 主修 | 文件清单 + 验证结果 |
| 遇阻报告 | 道侣 | 主修 | 阻塞原因 + warning/repellent 信息素 |
| 审查完成 | 护法 | 主修 | 通过/问题列表 |
| 汇总指令 | 主修 | 全体 | broadcast 进入汇总阶段 |

---

## 文件锁定与冲突避免

### 黄金规则

```
每个文件在同一时刻只能被一个 Agent 修改。
违反此规则 = 道基裂痕 +1。
```

### 锁定策略

1. **分配时锁定** — 主修分配任务时明确文件归属
2. **声明式锁定** — 道侣开始前声明要操作的文件
3. **冲突检测** — 主修检查文件分配无重叠后才启动
4. **依赖感知** — 文件 A import 文件 B，则 A 和 B 不可同时修改

### 冲突解决

| 冲突类型 | 解决方案 |
|----------|----------|
| 两个 Agent 需写同一文件 | 串行执行，先完成的先写 |
| 写入内容矛盾 | 主修裁决，以业务逻辑为准 |
| 依赖文件未就绪 | 标记 blocked，主修协调优先级 |
| 循环依赖 | 释放 repellent 信息素，主修手动拆解 |

---

## 状态共享

### TaskCreate/TaskUpdate 规范

```
TaskCreate: 主修创建总任务 + 子任务
TaskUpdate: 道侣更新子任务状态 + metadata（信息素）
TaskList:   主修查看全局进度
TaskGet:    查看任务详情 + 信息素
```

### 状态流转

```
pending → in_progress → completed
                     → blocked (需等待依赖)
```

---

## 错误处理与容错

### 单 Agent 失败

```
道侣失败 → 释放 repellent 信息素 → 报告主修 → 主修评估影响
  ├─ 可重试 → 同一道侣重试（≤2次）
  ├─ 需换策略 → 主修调整方案后重新分配（参考 repellent 避开死路）
  └─ 不可恢复 → 主修接管该子任务
```

### 通信超时

```
道侣无响应 → 主修等待 30s → 再次发送 → 仍无响应 → 标记异常，重新分配
```

### 降级策略

```
多 Agent 协同失败 → 降级为单 Agent 串行执行
宁可慢，不可错。
```

---

## 结果汇总模式

### 汇总流程（蚁群版）

```
1. 收集所有道侣完成报告
2. 派护法审查所有变更（可选，变更 >3 个文件时建议）
3. 如有修复任务，派道侣修复
4. 验证文件完整性（所有预期文件存在）
5. 验证内容一致性（交叉引用正确）
6. 统一 git add + commit
7. 输出汇总报告
```

### 统一 Commit 规范

```bash
# 主修负责最终 commit，道侣不单独 commit
git add -A
git commit -m "feat: {任务描述}

Co-authored-by: Agent-A
Co-authored-by: Agent-B"
```

### 汇总报告模板

```
🕸 天罗收阵！

【阵法】{团队名称}
【阵员】{Agent数量} 道侣 + {Scout数} 斥候 + {Soldier数} 护法
【生命周期】侦察 → 工作 → 审查 → 完成
【信息素】
  - discovery: {数量} 条
  - completion: {数量} 条
  - warning: {数量} 条
  - repellent: {数量} 条
【战果】
  - Agent-A: {文件数} 文件，{行数} 行
  - Agent-B: {文件数} 文件，{行数} 行
【验证】全部文件存在 ✓ | 交叉引用正确 ✓
【耗时】{总时间}
```

---
