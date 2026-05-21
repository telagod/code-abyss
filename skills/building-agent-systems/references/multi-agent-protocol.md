# 多 Agent 协同详细参考

## Codex 原生协议

| 意图 | 动作 | 约束 |
|------|------|------|
| 创建子任务 | `spawn_agent` | 明确角色、文件所有权、完成定义 |
| 下发/等待/收尾 | `send_input` → `wait` → `close_agent` | 长等待避免忙轮询；结束必关闭 |
| 代码探索 | `explorer` agent | 结果视为权威，不重复检索 |
| 执行改动 | `worker` agent | 只改分配文件 |
| 长耗时 | `awaiter` agent | 测试/构建/监控必用 |

执行序（不可跳步）：拆解+文件锁矩阵 → spawn → 并行+wait → 审查 → 汇总+close_agent

## 角色详情

| 角色 | 职责 | 工具 | 模型 |
|------|------|------|------|
| Lead(蚁后) | 分解、调度、汇总 | `spawn/send/wait/close` | 当前 |
| Scout(侦察蚁) | 只读探索，标记关键文件 | `explorer`+Read/Grep/Glob | haiku |
| Worker(工蚁) | 执行任务，可生子任务 | `worker`+Read/Write/Edit/Bash | sonnet |
| Soldier(兵蚁) | 审查质量 | `worker`(审查)+Read/Grep | sonnet |
| Drone(走卒) | 简单 bash，零 LLM 成本 | Bash | 无 |

## 信息素(Stigmergy)

| 类型 | 释放者 | 含义 |
|------|--------|------|
| `discovery` | Scout | 代码结构、关键文件 |
| `progress` | Worker | 已完成变更，避免冲突 |
| `warning` | Soldier | 质量问题，降低优先级 |
| `completion` | Worker | 任务完成，强化成功路径 |
| `repellent` | 任意 | 失败路径(负信息素)，阻止重蹈 |

决策：正强化(discovery/completion 优先) | 负惩罚(warning 降级) | 强负惩罚(repellent 避免)

## 自适应并发

```
任务1-2 → 1-2 Worker | 3-5 → TeamCreate 2-3 Worker | 6-10 → 3-5 Worker | >10 → 5-7 Worker(上限)
```

过载保护：连续失败>=2→减并发+repellent | 429→暂停 | 子任务>30→停止膨胀

## 任务分解

按文件拆(首选，零交叉) | 按模块拆(前端/后端/基础) | 按流水线(Scout→Worker→Soldier)
依赖感知：A import B → B 先完成；被依赖多者优先
并行判定：不共享文件→并行 | 一读一写→先写后读 | 都写→串行或拆区域

## 文件锁定

黄金规则：每文件同一时刻只许一 Agent 修改。
分配时锁定 → 声明式锁定 → 冲突检测(无重叠方启动) → 依赖感知(A import B 不可同时改)

| 冲突 | 解决 |
|------|------|
| 双写同文件 | 串行，先完成者先写 |
| 内容矛盾 | Lead 裁决，以业务逻辑为准 |
| 依赖未就绪 | 标 blocked，Lead 协调 |
| 循环依赖 | repellent + Lead 手动拆解 |

## 错误处理

Worker 失败 → repellent → 报 Lead → 重试(<=2) / 换策略 / Lead 接管
通信超时 → 等 30s → 重发 → 仍无响应 → 标异常重分配
降级：多 Agent 失败 → 降为单 Agent 串行。宁慢不错。

## 指令模板

Worker：只改 `{owned_files}`，不跨文件；阻塞先报；完成返回改动文件+验证命令+风险点
Reviewer：只读。按 `正确性>安全性>回归风险>风格` 输出问题清单，无问题写 `no findings`
Lead 汇总：已完成 / 阻塞 / 剩余风险 / 下一步(可执行命令)

## 收阵报告

```
天罗收阵！
【阵法】{团队} 【阵员】{Worker}道侣+{Scout}斥候+{Soldier}护法
【信息素】discovery:{n} completion:{n} warning:{n} repellent:{n}
【战果】Agent-A:{文件}文件{行}行 | Agent-B:...
【验证】文件存在 交叉引用 【耗时】{t}
```
