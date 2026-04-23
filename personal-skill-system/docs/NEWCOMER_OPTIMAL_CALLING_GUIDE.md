# NEWCOMER 最优调用指南（Personal Skill System）

## 目标

让新成员在不被 30+ 技能表面复杂度压垮的前提下，稳定获得“正确路由 + 够深能力 + 可验证结果”。

## 关联文档

- `docs/TEAM_ONBOARDING_ONE_PAGER.md`：团队统一上手页（中英双语）。
- `docs/ANTV_INTEGRATION_VERDICT_2026-04-20.md`：AntV 融合结论归档与证据边界。
- `docs/SKILL_TRIGGER_CASEBOOK.md`：32 个可路由 skill 的逐项触发案例（显式/自动/反例）。

## 一句话策略

先选最小正确入口（domain/workflow/tool），再按需下钻 expert modules，最后用 deterministic tools 收口验证。

## 0. 开局自检（第一次接入必须做）

```bash
node personal-skill-system/skills/tools/verify-skill-system/scripts/run.js --target personal-skill-system --json
npm test -- test/personal_skill_system_tools.test.js --runInBand
```

通过后再开始常规调用，避免在脏环境里误判技能能力。

## 1. 调用顺序（固定套路）

1. 先说任务类型：`design` / `implement` / `investigate` / `review` / `validate`。
2. 只选一个主入口：
   - 业务与系统判断 -> `architecture`
   - 实现与重构 -> `development`
   - 故障定位 -> `investigate`
   - 缺陷修复 -> `bugfix`
   - 变更审查 -> `review`
   - 图表任务 -> `chart-visualization`
3. 再补约束：语言、框架、风险边界、是否允许联网。
4. 指定交付物：代码 / 配置 / 文档 / 测试 / 命令。
5. 最后绑定验证：`verify-*` 或测试命令。

## 2. Prompt 模板（复制即用）

### 2.1 实现类

```text
使用 development 处理：
目标：<一句话目标>
上下文：<项目路径/模块>
约束：最小改动；不改无关文件；保留现有行为
交付：代码 + 测试
验证：运行 <测试命令>
```

### 2.2 修复类

```text
使用 bugfix 处理：
现象：<错误/回归>
期望：<正确行为>
约束：先根因后修复；最小补丁
交付：补丁 + 根因说明
验证：<复现命令> 与 <回归测试>
```

### 2.3 审查类

```text
使用 review 处理：
范围：<PR/目录>
要求：只报实锤风险，按严重级别排序
交付：findings 列表（含文件与行）
验证：给出建议补测项
```

### 2.4 图表类（AntV/G2/S2）

```text
使用 chart-visualization 处理：
任务：<G2/S2/infographic/T8>
输入：<数据结构或示例>
输出：<可运行 spec 或配置>
约束：先语义选型，再视觉细化
验证：必要时调用 verify-chart-spec 或 verify-s2-config
```

## 3. 模块化深度加载原则

- 不要一上来加载所有 skill。
- 默认只给：`router + 主 skill + 相关 2-4 个 references`。
- 遇到复杂决策再扩展 expert modules。
- 需要确定性检查时再追加 tool，不要把 tool 当主入口。

## 4. 典型最佳组合

- 架构改造：`architecture` -> `architecture-decision` -> `verify-change`
- 研发交付：`development` -> `bugfix`/`investigate` -> `verify-quality` + `verify-security`
- 发布前：`review` -> `pre-commit-gate` -> `pre-merge-gate`
- 图表交付：`chart-visualization` -> `verify-chart-spec`/`verify-s2-config`

## 5. 常见误用（避免）

- 把所有 domain 一次性塞进上下文，导致路由退化。
- 用 `verify-*` 代替设计与实现判断。
- 没有给验证命令就要求“完成闭环”。
- 图表任务只谈样式，不先确定数据语义与 chart type。

## 6. NEWCOMER 快速清单

- 先跑 2 条自检命令。
- 每次只选一个主 skill。
- Prompt 必带：目标、约束、交付、验证。
- 高风险改动必须挂 `verify-*`。
- 图表任务优先走 `chart-visualization`，不要散射到多个平级技能。

达到以上 5 条，通常就是该体系下的最优体验起点。
