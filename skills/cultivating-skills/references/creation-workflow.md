# 新 skill 创制流程

> 从 0 到 1 的脚手架。默认走 L0 本地，魔尊认可后升级。

## 触发判定

满足以下任一即可触发 `create`：

- 用户显式说"把这个做成 skill"、"沉淀一下"、"做个工具卡"
- 用户描述了**可复用的方法论**（不是单次任务）
- 已有外部资料（教程、规范、checklist）需要内化

## 五步炼制

### 1. 命名 + 定位

- `name`：kebab-case，gerund 形式优先（`analyzing-*`、`generating-*`、`cultivating-*`），与 [agentskills.io](https://agentskills.io/specification) 风格对齐
- 一句话答："这个 skill 解决什么独立问题？" 答不出来 → 不该独立成 skill
- 检查重复：`grep -r "name:" skills/*/SKILL.md` 看是否已有近义

### 2. 写 frontmatter（决定边界）

```yaml
---
name: <kebab-case>
description: <动词开头，说明做什么 + 何时触发，≥40 字>
compatibility: node>=18              # 仅 scripted 类需声明
user-invocable: <true|false>         # 默认 false，除非确实需要 / 命令调用
allowed-tools: Read                  # 默认最小权限，扩权必须说明理由
argument-hint: <参数提示>             # 仅 user-invocable 时
---
```

**默认拒绝原则：** `user-invocable: true` 必须有具体使用场景；`allowed-tools` 包含 `Bash`/`Write`/`Edit`/`WebFetch` 必须在 SKILL.md 内说明为何需要。

### 3. SKILL.md 主体（≤90 行硬约束）

骨架顺序：
1. **一句话定位**（引言下方）
2. **何时使用 / 何时不使用** 矩阵（决策型核心）
3. **解读输出 / 主流程**（如何用）
4. **与其他 skill 联动**（明确边界）
5. **使用**（命令示例）
6. **收口**（验收标准）

> 长度超 90 行 = 该往 `references/` 沉。重内容（规则表、模板、公式）必须下沉。

### 4. references 拆卷

| 内容类型 | 落点 |
|---------|------|
| 决策规则、判断阈值 | `rules.md` / `decision-matrix.md` |
| 工作流、步骤详解 | `workflow.md` / `procedures.md` |
| 模板、范例、代码片段 | `templates.md` / `examples.md` |
| 故障速查、FAQ | `troubleshooting.md` |

每卷开头一句话定位，方便 Agent 读 frontmatter 即知是否相关。

### 5. scripts（仅 scripted 类）

- **唯一 `.js` 入口**——registry 硬约束，多个会 fail
- 顶部 `#!/usr/bin/env node` + `'use strict'`
- 支持 `--json` 模式给 CI 用，`--verbose` 给人看
- 退出码：`0` 通过、`1` 命中阻断、`2` 参数错

## 验收闸

```bash
node scripts/skill_forge.js scan <skill-dir>     # 安全扫描
node scripts/skill_forge.js lint <skill-dir>     # frontmatter + 引用
npm run verify:skills                             # 全局契约
```

三关全过，方可 commit。

## 反模式

- ❌ skill 名是名词（`security`、`docs`）→ 用动名词（`analyzing-security`、`generating-docs`）
- ❌ description 含 "various"、"general"、"helper"→ 边界不清，等于没说
- ❌ SKILL.md 直接塞 1000 行内容 → 必须下沉 references
- ❌ scripts/ 多入口 → 拆成多 skill 或合并为一个 dispatcher
- ❌ 抄袭其他 skill 大段内容 → 用 reference 链接，不复制
