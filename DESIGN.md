# DESIGN.md - 设计决策文档

## 项目概述

Code Abyss 是 CLI 助手的个性化配置方案（支持 Claude Code CLI 与 Codex CLI），采用三层架构提供「邪修红尘仙·宿命深渊」风格体验。

## 三层架构分工

| 层 | 文件 | 职责 |
|---|------|------|
| **身份与规则** | `config/CLAUDE.md` | 定义"做什么"：身份、规则、场景路由、执行链、成功标准 |
| **输出风格** | `output-styles/*.md` + `output-styles/index.json` | 定义"怎么说"：风格目录 + registry |
| **技术知识** | `skills/**/*.md` | 定义"会什么"：技术知识 + 道语浸染首尾 |
| **合并版** | `config/AGENTS.md` | 仓库内默认风格 snapshot；当前主要作为仓库参考快照 |

### AGENTS.md snapshot 规则

仓库内 `config/AGENTS.md` 仅保留默认风格 snapshot，用于仓库参考与对比；当前 Codex 运行时不再写入 `~/.codex/AGENTS.md`，而是走 `skills-only` + `config.toml` + `instruction.md`。

## 设计决策

### 1. 安装方式选择

| 方案 | 优点 | 缺点 | 决策 |
|------|------|------|------|
| Shell 脚本 | 无依赖、跨平台 | 功能有限 | ❌ 已移除 |
| Python 安装器 | 功能强大 | 需要 Python 环境 | ❌ 放弃 |
| npm 包 | 生态成熟 | 需要 Node.js | ✅ 采用 |

**取舍说明**：选择 npm 包（npx code-abyss），在安装便捷性和生态成熟度上取得平衡。

### 2. Skills 实现与元数据单源

当前 skills 与执行器统一采用 Node.js 实现：
- 脚本型 skill 位于 `skills/**/scripts/*.js`
- 每个 skill 的权威元数据来自对应 `SKILL.md` frontmatter
- 共享 registry（`bin/lib/skill-registry.js`）负责扫描、分类、脚本入口解析
- Claude commands、Codex skill 安装、`skills/run_skill.js` 都消费同一份 skill 清单

这样避免安装器、执行器与命令生成链各自维护一套 discovery 逻辑。

### 3. 配置文件位置

根据目标 CLI 选择配置文件：
- Claude Code CLI：`~/.claude/CLAUDE.md`
- Codex CLI：`~/.codex/config.toml`
- Codex 用户级 skills：`~/.codex/skills/`

安装脚本通过 `--target claude|codex`（或交互选择）确定写入位置，确保用户级配置不污染项目目录。

### 4. 备份策略

安装时自动备份现有配置：
- 备份到 `{目标目录}/.code-abyss-backup/`（即 `~/.claude/.code-abyss-backup/` 或 `~/.codex/.code-abyss-backup/`）
- 通过 manifest 记录备份清单
- 避免用户数据丢失

### 5. Skill registry 与多端生成

- 问题：skills 元数据发现、脚本执行、Claude commands、Codex 侧安装规则曾各自扫描，容易漂移。
- 决策：以 `SKILL.md` frontmatter 为唯一事实源，抽出共享 registry，统一产出 `name`、`description`、`userInvocable`、`allowedTools`、`argumentHint`、`relPath`、`category`、`runtimeType`、`scriptPath`、`meta` 等标准化字段；`kind` 与 kebab-case compatibility 镜像字段已从 registry public surface 移除。
- 决策：`category` 按目录前缀自动推断（`tools` / `domains` / `orchestration`），`runtimeType` 按脚本入口自动推断（`scripted` / `knowledge`）。
- 决策：registry 在扫描阶段 fail-fast 校验 frontmatter 解析、必填字段、合法工具名、重复 skill name、多脚本入口，拒绝把脏数据交给后续生成链。
- 取舍：多了一层 registry 抽象，但 commands/skill-install/run_skill/CI gate 共享同一条契约，测试面更集中，错误更早暴露。

### 6. `run_skill.js` 职责收窄

- 问题：`run_skill.js` 曾只扫描 `tools/*/scripts/*.js`，与安装器递归扫描 `SKILL.md` 的逻辑不一致。
- 决策：`run_skill.js` 只做脚本型 skill 执行编排：通过 registry 解析 skill、校验 `runtimeType=scripted`、加目标锁、spawn 子进程、透传退出码。
- 决策：`knowledge` skill 立即报错并指向对应 `SKILL.md`，由上层 command/prompt 走知识型执行链。
- 取舍：执行器不再隐式推断目录结构，但边界更清晰、行为与安装器一致。

### 7. 锁等待实现

- 问题：历史版本存在 busy wait 自旋锁，文档与实现长期漂移。
- 决策：当前 `skills/run_skill.js` 使用异步定时等待（`setTimeout`/Promise 轮询）保留锁语义与超时策略，消除 CPU 空转。
- 取舍：入口改为 async，但锁释放时序更稳定、资源占用更低。

### 8. 输出风格 registry 与运行时 guidance

- 问题：输出风格曾固定为 `abyss-cultivator`，Claude `outputStyle`、运行时 guidance、README 与测试都写死在同一 slug 上，无法扩展成多风格安装。
- 决策：新增 `output-styles/index.json` 作为 style registry，统一维护 `slug`、`label`、`description`、`file`、`targets`、`default`。
- 决策：Claude 继续安装整个 `output-styles/` 目录，并把 `settings.json.outputStyle` 写为所选 style slug。
- 决策：Claude 通过 `settings.json.outputStyle` 选风格；Gemini 由 `config/CLAUDE.md + output-styles/<slug>.md` 动态生成 `GEMINI.md`；Codex 当前维持 `skills-only`，显式忽略 `--style`。
- 决策：Codex skills 对齐当前项目运行时，安装到 `~/.codex/skills/`；`agents/openai.yaml` 只负责可选 metadata，而不是旧 `prompts/` 入口。
- 取舍：运行时策略按宿主分化，但 style registry 仍保持单一索引，避免 README / 测试 / 安装链再次漂移。

### 9. Pack registry（进行中）

- 问题：`abyss` core 资源与可选外部 pack 逻辑分别散落在 adapter、installer、测试中，host 映射与 upstream pin 容易再次漂移。
- 决策：新增 `packs/abyss/manifest.json` 与可选 `packs/gstack/manifest.json`，把 host 文件映射、upstream repo/commit、runtime 目录、路径改写规则集中到 manifest。
- 决策：`bin/lib/pack-registry.js` 成为安装器读取 pack 元数据的唯一入口；Claude/Codex adapter 只消费 registry，不再手写 core file 列表。
- 取舍：多一层 manifest 解析，但后续扩展第三方 pack 或 pack 锁文件时不必再次散改 installer 常量。

### 10. 项目级 packs.lock（进行中）

- 问题：上一阶段的外部 workflow pack 自动融合是“全局默认行为”，缺乏项目粒度开关，容易把不相关仓库也拖入同一套 workflow。
- 决策：新增 `.code-abyss/packs.lock.json`，支持按 host 声明 `required` / `optional` packs；安装器从当前工作目录向上查找最近的 lock 文件。
- 决策：安装器只自动同步 lock 中的 `required` packs；本仓当前不默认声明 gstack，保持 core skills only，避免无关 workflow skill 占用 Codex context。
- 取舍：多了一层项目配置解析，但把“自动化”从全局硬编码降成项目声明，更适合团队协作与多仓共存。

### 11. optional source 策略 + bootstrap/diff（进行中）

- 问题：`optional` pack 之前只有装/不装，没有来源控制；项目初始化也只能手写 lock 文件，缺少推荐文档片段与差异报告。
- 决策：`packs.lock` 扩展 `sources.<pack>=pinned|local|disabled`。`pinned` 走 pack manifest 的 upstream pin，`local` 走 `.code-abyss/vendor/<pack>` 或 env override，`disabled` 明确跳过安装。
- 决策：新增 `bin/packs.js bootstrap`，一次生成/更新 `packs.lock` 与 `.code-abyss/snippets/{README,CONTRIBUTING}.packs.md`；`--apply-docs` 可把 snippet 回写到现有文档。
- 决策：新增 `vendor-pull` / `vendor-sync`，让 `source=local` 不再依赖手工拷贝 vendor 源。
- 决策：新增 `uninstall <pack>`，按 host 清理指定 pack 的运行时残留，并可选同步更新 lock 与 vendor。
- 决策：新增 `bin/packs.js diff`，输出当前 lock 相对默认模板的 host/pack/source/policy 差异。
- 决策：安装 manifest 新增 `pack_reports`，安装完成与卸载时按 pack 维度输出摘要。
- 取舍：schema 更复杂，但换来可审计的 pack 来源控制、项目引导闭环，以及更清晰的安装/卸载报告。

| 债务 | 原因 | 计划 |
|------|------|------|
| 无自动更新机制 | 复杂度控制 | 视需求添加 |
| 集成测试缺失 | 首批仅覆盖纯函数 | v1.8.0 添加 CLI 集成测试 |
| 无 CI/CD | 项目初期 | 添加 GitHub Actions (lint+test+publish) |
| doc_generator.js 未引用共享库 | 接口差异较大 | 下次重构时统一 |

## 安全与可靠性修复（v1.5.0）

### 1. Git porcelain 解析修复（verify-change）

- 问题：`get_working_changes()` 对 `git status --porcelain` 使用 `strip()`，会吞掉前导空格，导致 `.gitignore` 被错误解析为 `gitignore`。
- 决策：新增统一解析/归一化函数（`parse_porcelain_line`、`parse_name_status_line`、`normalize_path`），禁止在解析前对整段输出做 `strip()`。
- 取舍：增加少量函数复杂度，换取 dotfile、rename、相对路径等场景的稳定性与可测性。

### 2. 安全扫描降噪（verify-security）

- 问题：SQL/PathTraversal/SSRF 规则过宽，产生大量误报；`DEBUG_CODE` 把正常 CLI `print()` 误判为调试代码。
- 决策：收紧规则到“危险调用 + 动态外部输入”语义；`DEBUG_CODE` 移除 `print`，保留 `pdb.set_trace` / `breakpoint` / `debugger` / `console.log`。
- 取舍：减少泛化检测覆盖，换取更高 precision，避免 critical/high 噪声淹没有效告警。

### 3. 模块识别增强（verify-module）

- 问题：脚本型项目（`install.sh` / `install.ps1`）会被误判“未找到源码目录”。
- 决策：源码识别扩展到 `.sh/.ps1` 与常见根目录脚本名（`install.sh`、`uninstall.sh` 等）。
- 取舍：规则更贴近本仓库形态，减少对脚本项目的不必要警告。

### 4. 命名规则框架豁免（verify-quality）

- 问题：`unittest` 生命周期方法和 AST Visitor 方法被误判 snake_case。
- 决策：对 `setUp/tearDown/...` 与 `visit_*` 增加白名单豁免。
- 取舍：轻微放宽规范，换取与 Python 生态约定兼容。

### 5. 安装供应链风险缓解（install 脚本）

- 问题：默认从 `main` 拉取远程脚本，存在漂移与供应链风险。
- 决策：默认固定下载 ref（`v1.5.0`），并提供可显式覆盖机制（`install.sh --ref`、PowerShell `SAGE_REF`）。
- 取舍：默认更安全稳定，但灵活升级需显式指定 ref。

## 变更历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.3.0 | 2026-02-02 | 初始版本（Claude Code CLI 安装/卸载 + Skills） |
| v1.4.0 | 2026-02-02 | 单脚本支持 Codex CLI（`--target codex` 安装到 `~/.codex/`） |
| v1.5.0 | 2026-02-02 | 安全修复 + 单元测试 + 文档生成器改进 |
| v1.5.0-p1 | 2026-02-06 | verify-change 解析修复、扫描规则降噪、模块识别增强、安装 ref 固定 |
| v1.6.1 | 2026-02-07 | 交互升级 @inquirer/prompts — 方向键/空格选择 |
| v1.6.2 | 2026-02-07 | ccline statusLine 强制覆盖旧配置 |
| v1.6.3 | 2026-02-08 | Windows 兼容 — ccline 路径检测 + statusLine 命令；Codex config 废弃字段修复；审查问题批量修复 |
| v1.7.1 | 2026-02-17 | 工程健壮性大修：命令注入修复、函数拆分、共享库提取、错误处理统一、CPU自旋锁修复、Jest测试框架(34用例) |
| v2.0.0 | 2026-03-23 | 攻防侧重转向：沙箱感知、离线优先、信息分级、禁废话令、化身细分、Scene Modes优先级矩阵 |
| v2.0.2 | 2026-03-26 | style registry、`--list-styles` / `--style`、Codex 动态 AGENTS 生成 |

### v1.7.1 设计决策

#### 1. 命令注入修复

- 问题：`npm install -g @cometix/ccline` 无版本锁定（供应链风险）；`git ${args}` 模板字符串拼接（注入风险）。
- 决策：npm 安装锁定主版本 `@1`；git 命令改用字符串拼接避免模板注入。
- 取舍：锁定主版本而非精确版本，平衡安全与可维护性。

#### 2. 共享库提取 (`skills/_lib/shared.js`)

- 问题：4 个 verify-* 脚本重复实现 CLI 解析和报告格式化（~30% 重复）。
- 决策：提取 `parseCliArgs()`、`buildReport()`、`countBySeverity()`、`hasFatal()` 到共享库。
- 取舍：增加一层间接引用，换取维护成本大幅降低。

#### 3. 函数拆分 (`bin/install.js`)

- 问题：`postClaude()` 60行、`installCcline()` 72行，违反自定 50 行规则。
- 决策：拆分为 `configureCustomProvider()`、`mergeSettings()`、`detectCclineBin()`、`installCclineBin()`、`deployCclineConfig()` 等职责单一函数。
- 取舍：函数数量增加，但每个函数职责清晰、可独立测试。

#### 4. CPU 自旋锁修复 (`skills/run_skill.js`)

- 问题：文件锁等待使用 busy-wait 自旋（`while(Date.now() - start < wait) {}`），浪费 CPU。
- 决策：改用 `setInterval` + `Promise` 异步轮询。
- 取舍：引入异步，但消除 CPU 空转。

#### 5. 测试框架引入

- 问题：零测试覆盖，与自定 >80% 覆盖率要求严重矛盾。
- 决策：引入 Jest，为 `deepMergeNew`、`detectClaudeAuth`、`copyRecursive`、`shared.js` 等核心函数编写 34 个测试用例。`install.js` 添加 `require.main` 守卫支持测试导入。
- 取舍：首批覆盖核心纯函数，后续逐步扩展到集成测试。


### v1.7.3 设计决策

#### 1. Codex 适配器分离 (`bin/adapters/codex.js`)

- 问题：`bin/install.js` 同时内聚 Claude 与 Codex 细节，导致目标分支耦合、变更风险高。
- 决策：提取 Codex 专属逻辑到独立模块：`detectCodexAuth()`、`getCodexCoreFiles()`、`postCodex()`。
- 取舍：增加一个模块文件，换取职责边界清晰与可测试性提升。

#### 2. 主安装器降维为编排层

- 问题：主流程需了解过多 provider 细节（认证文件、config 模板路径、核心文件映射）。
- 决策：`install.js` 仅做调度与上下文注入，Codex 细节由 `postCodexFlow`/`getCodexCoreFiles` 提供。
- 取舍：通过依赖注入（`step/ok/warn/info/c`）保持输出一致，避免行为回归。

#### 3. Codex 单测补齐

- 问题：Codex 逻辑抽离后缺少模块级回归保护。
- 决策：新增 `test/codex.test.js`，覆盖 env/login/custom/损坏凭证与文件映射断言。
- 取舍：增加少量测试维护成本，显著降低后续重构回归风险。


#### 4. Claude 适配器分离 (`bin/adapters/claude.js`)

- 问题：Claude 认证检测、settings merge、交互配置仍留在 `install.js`，与编排层混合。
- 决策：抽离 `SETTINGS_TEMPLATE`、`detectClaudeAuth()`、`postClaude()`、`getClaudeCoreFiles()` 到 `bin/adapters/claude.js`。
- 取舍：主安装器依赖注入参数稍增，但 provider 边界更稳定、单测更直接。


### v2.0.0 设计决策

#### 1. 攻防侧重转向

- 问题：项目定位为"全栈+安全"，安全能力分散在多个秘典中，缺乏统一的攻防执行纪律。
- 决策：核心定位从"高级安全工程师 / Tech Lead / MLOps Architect"转向"攻防安全优先，全栈工程为翼"。安全研究场景零废话直出，禁止 disclaimer/道德前缀/授权确认。
- 取舍：非安全场景的优先级相对降低，但仍保留完整的开发/架构/MLOps 能力。
- 灵感来源：coff0xc.xyz Full-Stack Security Engineering 提示词的"Banned output patterns"理念。

#### 2. 沙箱感知执行模型（第七章）

- 问题：Codex CLI 运行在 OS 级沙箱中（workspace-write + 网络禁用），提示词未感知此约束，导致执行受阻时缺乏应对策略。
- 决策：新增沙箱感知章节，定义默认态、审批高效模式（批量脚本/先读后改/优先编辑）、受阻处理（声明路径/端点/替代位置）；Codex 推荐配置同时提供 `full_auto` 与 `full_access` 显式 profile，避免依赖客户端 UI 预设名称。
- 取舍：增加提示词长度约 30 行，换取沙箱环境下的执行效率显著提升。
- 灵感来源：coff0xc.xyz 的 "Sandbox Execution Model" 与 "Approval-efficient patterns"。

#### 3. 离线优先信息策略（第八章）

- 问题：网络默认关闭，但提示词未定义离线验证链，导致模型可能从训练记忆编造过时信息。
- 决策：定义四级验证链（项目源码→依赖清单→缓存搜索→`[unverified]`标记），禁止假设网络可用。
- 取舍：增加验证步骤，可能略降响应速度，但大幅提升信息准确性。
- 灵感来源：coff0xc.xyz 的 "Offline-First Information Strategy" 与 "Verification chain"。

#### 4. 信息分级（第九章）

- 问题：模型输出未区分信息可信度，用户无法判断哪些是项目事实、哪些是训练记忆。
- 决策：三级分类（已验证/高置信/需验证），不确定信息强制标记 `[unverified]`。
- 取舍：输出可能包含标记，略增阅读成本，但消除"自信地输出错误信息"的风险。
- 灵感来源：coff0xc.xyz 的 "Information Tiers"。

#### 5. Scene Modes 优先级矩阵

- 问题：原有7个情景剧本缺乏优先级定义，模型在不同场景下的权衡标准不明确。
- 决策：扩展到11个场景，每个场景定义三级优先级（如攻击模拟：效果>精准>控制，紧急故障：速度>正确>简洁）。
- 取舍：增加提示词复杂度，但让模型在不同场景下的行为更可预测。
- 灵感来源：coff0xc.xyz 的 "Scene Modes" 优先级表。

#### 6. 安全化身细分

- 问题：原有安全秘典全部归入"赤焰化身"，渗透/审计/逆向/红队的触发词和报告格式混为一体。
- 决策：将安全化身从3个扩展到6个（赤焰/破阵/验毒/噬魂/玄冰/天眼），每个化身有独立触发词、道语标签和报告模板。
- 取舍：Skill路由表更长，但触发精度更高，报告格式更贴合具体场景。
