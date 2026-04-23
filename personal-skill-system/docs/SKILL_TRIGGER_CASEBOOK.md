# SKILL Trigger Casebook（全量触发案例）

## 用法说明

这份文档专门回答一个问题：**每个 skill 到底怎么触发**。

每个 skill 给 3 组样例：

- `显式触发`：你直接点名 skill，命中率最高。
- `自动触发`：你不点名，靠语义路由命中。
- `易误判反例`：这句话看起来像，但不该触发该 skill。

推荐对 NEWCOMER 的默认动作：

1. 先用 `显式触发` 跑通 1 次。
2. 再改成 `自动触发` 看路由是否仍命中。
3. 若命中不稳，回到显式触发并补充约束与交付物。

---

## Workflow

### `skill-evolution`
- 显式触发：
`使用 skill-evolution 处理：重构 personal skill system 的 route-map、registry 与 references 分层。`
- 自动触发：
`我想升级这套技能体系的路由策略和治理质量，不是改业务代码。`
- 易误判反例：
`修一下登录接口 500。`（应走 `bugfix` 或 `investigate`）

### `investigate`
- 显式触发：
`使用 investigate 处理：定位订单重复扣费的根因，先证据后修复。`
- 自动触发：
`这个功能昨天还能用，今天突然坏了，先帮我查根因。`
- 易误判反例：
`我已经知道原因了，直接改代码。`（应走 `bugfix`）

### `bugfix`
- 显式触发：
`使用 bugfix 处理：修复支付回调签名校验回归，最小补丁并给回归测试。`
- 自动触发：
`请修复这个回归 bug，并保证不影响现有行为。`
- 易误判反例：
`先帮我分析为什么会坏。`（应先走 `investigate`）

### `review`
- 显式触发：
`使用 review 处理：审查这个 PR，只输出按严重级排序的风险项。`
- 自动触发：
`帮我做一次代码评审，重点看行为回归和测试盲区。`
- 易误判反例：
`直接把需求实现出来。`（应走 `development`）

### `architecture-decision`
- 显式触发：
`使用 architecture-decision 处理：比较单体拆分微服务的方案并给迁移/回滚路径。`
- 自动触发：
`我们在 Kafka 和 RabbitMQ 之间做选型，给出权衡和迁移计划。`
- 易误判反例：
`帮我把这个函数改快一点。`（应走 `development`）

### `multi-agent`
- 显式触发：
`使用 multi-agent 处理：把这次重构拆成并行子任务，明确 ownership 和文件边界。`
- 自动触发：
`这个任务太大，帮我做并行委派方案并安排集成顺序。`
- 易误判反例：
`只改一个文件的小 bug。`（无需多 agent）

### `ship`
- 显式触发：
`使用 ship 处理：按发布流程执行，包含变更检查、门禁与回滚预案。`
- 自动触发：
`准备上线这次改动，给我完整发布清单和风险控制。`
- 易误判反例：
`仅做静态代码审查，不上线。`（应走 `review`）

---

## Tool

### `verify-security`
- 显式触发：
`运行 verify-security：扫描 auth、secret、deserialization 风险并输出文件行号。`
- 自动触发：
`对这个模块做漏洞扫描和安全校验。`
- 易误判反例：
`帮我设计页面视觉风格。`（应走 `frontend-design`）

### `verify-change`
- 显式触发：
`运行 verify-change：仅分析本次 diff 的风险面和文档同步。`
- 自动触发：
`做一份基于变更集的风险审计。`
- 易误判反例：
`给我讲讲系统架构怎么设计。`（应走 `architecture`）

### `verify-module`
- 显式触发：
`运行 verify-module：检查新模块结构完整性和 README/DESIGN 是否齐全。`
- 自动触发：
`帮我查这个新模块是否缺文档和关键目录。`
- 易误判反例：
`扫描安全漏洞。`（应走 `verify-security`）

### `verify-quality`
- 显式触发：
`运行 verify-quality：检查复杂度、函数长度、重复代码与可维护性异味。`
- 自动触发：
`做一次代码质量扫描，给出主要异味。`
- 易误判反例：
`验证发布门禁。`（应走 `pre-merge-gate`）

### `verify-skill-system`
- 显式触发：
`运行 verify-skill-system：校验 skill frontmatter、registry、route-map、fixtures 一致性。`
- 自动触发：
`检查这套个人技能系统是否结构自洽。`
- 易误判反例：
`修一个业务 API bug。`（应走 `bugfix`）

### `verify-chart-spec`
- 显式触发：
`运行 verify-chart-spec：校验这段 G2 spec 是否存在 v4 API 漂移和交互配置错误。`
- 自动触发：
`帮我检查这个 G2 图表配置是否合法。`
- 易误判反例：
`分析 S2 SheetComponent 配置。`（应走 `verify-s2-config`）

### `verify-s2-config`
- 显式触发：
`运行 verify-s2-config：检查 SheetComponent、dataCfg.fields 与分页配置。`
- 自动触发：
`帮我校验 S2 透视表配置有没有结构错误。`
- 易误判反例：
`检查 G2 mark/transform 配置。`（应走 `verify-chart-spec`）

### `gen-docs`
- 显式触发：
`运行 gen-docs：为新模块生成 README.md 与 DESIGN.md 工程骨架。`
- 自动触发：
`给这个新目录生成文档模板。`
- 易误判反例：
`对现有 PR 做风险评审。`（应走 `review`）

---

## Guard

### `pre-commit-gate`
- 显式触发：
`运行 pre-commit-gate：只对 changed files 执行提交前门禁。`
- 自动触发：
`提交前帮我跑一遍门禁检查。`
- 易误判反例：
`我要做系统选型讨论。`（应走 `architecture`）

### `pre-merge-gate`
- 显式触发：
`运行 pre-merge-gate：在合并前执行质量/安全/变更门禁并给放行结论。`
- 自动触发：
`合并前帮我做 release gate 检查。`
- 易误判反例：
`定位线上故障根因。`（应走 `investigate`）

---

## Domain

### `architecture`
- 显式触发：
`使用 architecture 处理：定义服务边界、数据流与可靠性约束。`
- 自动触发：
`我们要设计 API 边界、缓存策略和队列解耦方案。`
- 易误判反例：
`只改这个 SQL 性能问题。`（通常先走 `development`）

### `development`
- 显式触发：
`使用 development 处理：在 payments 模块实现幂等写入和回归测试。`
- 自动触发：
`请实现这个功能并重构相关代码。`
- 易误判反例：
`只需要做安全审计报告。`（应走 `security` 或 `verify-security`）

### `security`
- 显式触发：
`使用 security 处理：建立 authz 边界与 secret 轮换策略。`
- 自动触发：
`帮我审计这段鉴权逻辑是否有越权风险。`
- 易误判反例：
`设计首页视觉层级。`（应走 `frontend-design`）

### `chart-visualization`
- 显式触发：
`使用 chart-visualization 处理：生成 G2 销售趋势图并给出可运行 spec。`
- 自动触发：
`请用 AntV S2 做透视表，配置 rows/columns/values 与分页。`
- 易误判反例：
`只做按钮排版和字体优化。`（应走 `frontend-design`）

### `frontend-design`
- 显式触发：
`使用 frontend-design 处理：重构页面信息层级、可访问性与交互反馈。`
- 自动触发：
`优化这个页面的 UI/UX 和组件模式。`
- 易误判反例：
`做数据库索引优化。`（应走 `development`）

### `infrastructure`
- 显式触发：
`使用 infrastructure 处理：设计 K8s 多环境拓扑、GitOps 与身份平面。`
- 自动触发：
`我们要做 Kubernetes 集群与 Terraform 基础设施规划。`
- 易误判反例：
`修复一个前端组件 bug。`（应走 `bugfix`/`development`）

### `data-engineering`
- 显式触发：
`使用 data-engineering 处理：设计 Kafka->Flink->dbt 数据管道与质量契约。`
- 自动触发：
`帮我做 ETL/流处理方案，关注数据质量和对账。`
- 易误判反例：
`设计登录页视觉风格。`（应走 `frontend-design`）

### `devops`
- 显式触发：
`使用 devops 处理：设计 CI/CD 门禁、观测与回滚流程。`
- 自动触发：
`帮我完善发布流水线和告警 runbook。`
- 易误判反例：
`做业务领域建模。`（应走 `architecture`）

### `ai`
- 显式触发：
`使用 ai 处理：设计 RAG 检索策略、eval 方案与 guardrail。`
- 自动触发：
`我们要做 Agent + Prompt + Eval 体系，给落地方案。`
- 易误判反例：
`仅做 K8s 节点规格规划。`（应走 `infrastructure`）

### `orchestration`
- 显式触发：
`使用 orchestration 处理：拆分跨团队任务依赖并定义交付握手协议。`
- 自动触发：
`这个项目多人协作混乱，帮我做任务分解和集成编排。`
- 易误判反例：
`只修一个函数。`（应走 `development` 或 `bugfix`）

### `mobile`
- 显式触发：
`使用 mobile 处理：设计 iOS/Android 离线同步与权限策略。`
- 自动触发：
`我们做 React Native 客户端，给生命周期和网络策略建议。`
- 易误判反例：
`设计后端队列拓扑。`（应走 `architecture`/`infrastructure`）

---

## Frontend Variant（风格变体）

### `claymorphism`
- 显式触发：
`使用 claymorphism 处理：输出软质黏土风组件样式规范。`
- 自动触发：
`我要 soft UI / clay 风格的面板和卡片。`
- 易误判反例：
`做 API 边界设计。`（应走 `architecture`）

### `glassmorphism`
- 显式触发：
`使用 glassmorphism 处理：生成磨砂玻璃风 UI token 与组件示例。`
- 自动触发：
`做一套 frosted glass 风格界面。`
- 易误判反例：
`排查数据库慢查询。`（应走 `development`）

### `liquid-glass`
- 显式触发：
`使用 liquid-glass 处理：按液态玻璃设计语言实现卡片与导航。`
- 自动触发：
`要 Apple liquid glass 风格的 UI 方案。`
- 易误判反例：
`做漏洞扫描。`（应走 `verify-security`）

### `neubrutalism`
- 显式触发：
`使用 neubrutalism 处理：生成高饱和、粗边框、重阴影的界面规范。`
- 自动触发：
`做新粗野主义风格页面。`
- 易误判反例：
`设计消息队列重试策略。`（应走 `architecture`/`devops`）

---

## 一条总诀（给 NEWCOMER）

当你不确定该触发哪个 skill，先用这句：

`我希望你先判断最合适的单一主 skill（domain/workflow/tool），说明为什么，然后执行并给验证命令。`

如果命中不稳，再改成：

`使用 <skill-name> 处理：<目标>；约束：<边界>；交付：<产物>；验证：<命令>。`

