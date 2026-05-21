---
name: verifying-modules
description: Scans directory structure, detects missing documentation, and verifies code-doc synchronization. Use when checking module completeness, README presence, or DESIGN.md alignment. Automatically triggered after creating new modules.
compatibility: node>=18
user-invocable: false
allowed-tools: Bash, Read, Glob
argument-hint: <模块路径>
---

# 模块完整性校验关卡

> 文档不齐不算交付。模块是否能被外人独立理解，是「完成」的最低门槛。

## 何时使用

| 场景 | 跑 | 理由 |
|------|------|------|
| 新建模块 | ✅ 必跑 | 阻断「无文档落地」 |
| 模块重构（边界变化） | ✅ | 文档随边界更新 |
| 接收他人模块 | ✅ | 检查可理解性 |
| 提交前（涉及模块新增） | ✅ | 最后闸 |
| 仅函数级修改 | ❌ | 走 [analyzing-changes](../analyzing-changes/SKILL.md) 即可 |

## 必备文件

| 文件 | 缺失后果 | 备注 |
|------|----------|------|
| `README.md` | 阻断交付 | 用户视角 |
| `DESIGN.md` | 阻断交付 | 维护者视角 |
| `tests/` | 警告 | 单文件模块或纯类型声明可豁免 |
| `__init__.py` | 提示（仅 Python） | 视项目布局而定 |

## 文档要求

### README（外部视角，回答「这是什么、怎么用」）

- 模块名与定位
- 存在理由（解决什么问题，**不是**列功能清单）
- 核心职责（一句话）
- 依赖关系（上游：依赖什么；下游：被谁依赖）
- 快速使用示例（5 分钟跑通）

### DESIGN（内部视角，回答「为什么这样设计」）

- 设计目标（含非目标）
- 方案选择与理由（对比 ≥2 选项）
- 关键决策（含权衡）
- 已知限制
- 变更历史（重大设计调整）

## 何时豁免

- **生成代码模块**（protobuf、OpenAPI client 等）→ 顶级 README 提一句即可，无需 DESIGN
- **配置/数据模块**（fixtures、seed data）→ README 说明用途与字段含义即可
- **私有 utility**（`_internal/`、`internal/`）→ README 简化，DESIGN 可缺

## 与其他 skill 联动

- 缺文档 → 用 [generating-docs](../generating-docs/SKILL.md) 生成骨架，再人工填决策
- 通过后 → 串 [analyzing-security](../analyzing-security/SKILL.md) 扫新增攻击面
- 大改后 → 串 [analyzing-changes](../analyzing-changes/SKILL.md) 看辐射面

## 使用

```bash
node scripts/module_scanner.js <模块路径>
node scripts/module_scanner.js <模块路径> -v       # 详细
node scripts/module_scanner.js <模块路径> --json   # CI 用
```

## 收口

阻断项必修。警告项可在 DESIGN 留「不写测试的理由」（如纯接口声明、纯常量）。**「以后补」不算理由。**
