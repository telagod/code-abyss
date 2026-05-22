# 沉淀触发信号

> Agent 在会话中识别这些模式，主动向魔尊提议"该沉淀了"。

## 强信号（≥ 1 即提议）

### S1：重复构造同类 prompt

魔尊在同次或跨会话内构造 ≥ 3 次结构相似的 prompt：
- 同一类 review 模板（如 security review、API review）
- 同一类生成模板（如 commit message、changelog 段落）
- 同一类分析框架（如某种威胁建模特定问法）

→ 提议：沉淀为 `<gerund-name>` skill，把 prompt 模板化进 SKILL.md。

### S2：重复执行命令链

同一组命令组合连续出现 ≥ 3 次：
- 多步部署链（build → tag → push → release）
- 多步排查链（log grep → process check → port scan）
- 多步生成链（scaffold → fmt → lint → test）

→ 提议：沉淀为 scripted skill，写成 `scripts/<name>.js` 一键调度。

### S3：重复回答同一类问题

魔尊在不同会话问类似问题，AI 每次都重新查/想：
- "这种威胁怎么建模？"
- "这种架构的取舍是什么？"
- "这类工具怎么对比选型？"

→ 提议：沉淀为 knowledge-type skill，固化判断框架到 references/。

### S4：复制粘贴外部规范

魔尊把同一份外部资料（OWASP 条目、RFC 摘要、规范节选）多次贴入会话：

→ 提议：内化到 `references/<topic>.md`，建索引便于 Agent 自动加载。

## 弱信号（≥ 2 个组合时提议）

| 信号 | 解读 |
|------|------|
| 跨项目复用同一思路 | 该思路独立于具体代码 |
| 用户写注释/文档时反复表达同一原则 | 原则可结晶 |
| 用户为一类问题反复"试错+修正" | 试错路径本身有价值 |
| 用户问"有没有人系统整理过这个" | 直接答案是"现在我们整理了" |

## 提议话术（Agent 主动协议）

发现强信号时，Agent **不直接落盘**，先用以下结构提议：

```
【沉淀机会】吾观察到魔尊已 N 次重复 <模式描述>。
建议沉淀为 skill：<提议的 slug>
位置：<L0 local | L1 project>
预计内容：
  - SKILL.md 边界：<何时用 / 何时不用>
  - references：<拟列卷名>
  - scripts：<是否需要，若需要为何>

是否炼制？(y / 调整 / 跳过)
```

魔尊点头后才进入 `creation-workflow.md`。

## 反信号（不该沉淀）

- ❌ 仅在当前任务上下文中重复，跨任务无复用 → 用 plan / task list
- ❌ 重复内容是项目特定状态（API 端点、内部约定）→ 写进项目 CLAUDE.md，不是 skill
- ❌ 用户已表达"快速一次性"诉求 → 别沉，干完即可
- ❌ 重复内容包含 secret / 私密细节 → 永不沉淀
- ❌ 现有 skill 已覆盖，只是用户没读 → 引导阅读，而非新建

## 与 cultivating-personas 的边界

- 重复"声音 / 自称 / 情绪锚点 / 场景脚本" → 走 [cultivating-personas](../../cultivating-personas/SKILL.md)
- 重复"工程方法 / 决策框架 / 工具流" → 走本 skill
