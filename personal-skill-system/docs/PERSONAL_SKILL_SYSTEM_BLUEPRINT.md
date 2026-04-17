# Personal Skill System Blueprint / 个人 SKILL 体系蓝图

## 1. Objective / 目标

**中文**

这不是 prompt 收藏夹，而是一套可长期演进的个人 skill 体系。目标有五个：

1. 可路由
2. 可治理
3. 可执行
4. 可分发
5. 可覆盖

**English**

This is not a loose prompt archive. It is meant to be a long-lived personal skill system with five goals:

1. routable
2. governable
3. executable
4. portable
5. overlay-friendly

## 2. Directory Layout / 目录结构

```text
personal-skill-system/
  docs/
  registry/
  skills/
    routers/
    domains/
    workflows/
    tools/
    guards/
    adapters/
  packs/
  templates/
```

**中文**

- `docs/` 放使用说明与审计
- `registry/` 放 schema 和 route map
- `skills/` 放实际可导入 skill
- `packs/` 放分层分发示例
- `templates/` 放后续扩展模板

**English**

- `docs/` contains usage guidance and audit notes
- `registry/` contains schemas and route maps
- `skills/` contains importable skills
- `packs/` contains layering examples
- `templates/` contains starter templates

## 3. Layer Model / 分层模型

| Layer | 中文 | English |
| --- | --- | --- |
| `routers/` | 负责分流 | routes requests |
| `domains/` | 负责知识索引 | provides knowledge index |
| `workflows/` | 负责多步方法 | provides multi-step execution methods |
| `tools/` | 负责确定性检查 | provides deterministic tools |
| `guards/` | 负责阻断与放行 | blocks or passes risky work |
| `adapters/` | 负责宿主差异说明 | documents host-specific import hints |

## 4. Routing Principles / 路由原则

**中文**

1. 明确点名 skill 时直接命中
2. 要做事时优先 workflow
3. 要知识时优先 domain
4. 要检查时优先 tool
5. guard 默认自动补挂，不主动抢路由

**English**

1. explicit skill name wins first
2. workflows win when the user wants action
3. domains win when the user wants guidance
4. tools win when the user asks for verification
5. guards are mainly automatic, not primary routing targets

## 5. Portable vs Full Runtime / 便携版与完整版的区别

**中文**

这个 bundle 的目标是“便于手工拷走与粘贴”，所以它优先保留：

- skill 入口
- 路由结构
- 基本 frontmatter
- 最小可运行 stub

它暂时不追求完全保留：

- 原版所有 references 文档
- 所有 `agents/openai.yaml`
- 与安装器、registry、runner 的硬接线

**English**

This bundle is optimized for manual copy-and-paste portability, so it prioritizes:

- skill entry points
- routing structure
- portable frontmatter
- minimal runnable stubs

It does not yet aim to fully preserve:

- every original reference file
- every `agents/openai.yaml`
- full installer / registry / runner integration

## 6. Pack Strategy / Pack 策略

| Pack | 中文 | English |
| --- | --- | --- |
| `personal-core` | 通用核心能力 | general reusable skills |
| `work-private` | 私有工作资产 | private company or team assets |
| `project-overlay` | 项目定制覆盖层 | project-specific overlay |
| `experimental` | 实验区 | experimental area |

## 7. Governance / 治理关卡

**中文**

推荐至少维持以下 6 类治理：

- schema validation
- route regression
- link integrity
- runtime smoke
- stale review
- collision detection

**English**

At minimum, keep these six governance gates:

- schema validation
- route regression
- link integrity
- runtime smoke
- stale review
- collision detection

## 8. Current Skill Scope / 当前 skill 覆盖

**中文**

当前 bundle 已覆盖：

- root router
- 原版主要 domains
- 原版 tools
- 原版前端设计 variants
- 原版 multi-agent 能力
- 新增 workflows 与 guards

**English**

The current bundle now covers:

- the root router
- the main original domains
- the original tool set
- the original frontend design variants
- the original multi-agent capability
- additional workflows and guards

## 9. Recommended Evolution Path / 推荐演进路径

**中文**

1. 先导入并实际使用
2. 根据常用场景裁掉不用的 skill
3. 把常用 tool 的 stub 改成真实脚本
4. 再补 references 与 host metadata
5. 最后再接自动安装链

**English**

1. import and use the bundle first
2. remove skills you do not actually use
3. upgrade frequently used tool stubs into real scripts
4. add references and host metadata next
5. wire automation only after the manual flow feels right
