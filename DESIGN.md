# DESIGN.md - 设计决策文档

## 项目概述

Code Abyss 是 CLI 助手的个性化配置方案（支持 Claude Code CLI 与 Codex CLI），采用三层架构提供「邪修红尘仙·宿命深渊」风格体验。

## 三层架构分工

| 层 | 文件 | 职责 |
|---|------|------|
| **身份与规则** | `config/CLAUDE.md` | 定义"做什么"：身份、规则、场景路由、执行链、成功标准 |
| **输出风格** | `output-styles/abyss-cultivator.md` | 定义"怎么说"：道语标签、情绪递进、报告模板、术语映射 |
| **技术知识** | `skills/**/*.md` | 定义"会什么"：技术知识 + 道语浸染首尾 |
| **合并版** | `config/AGENTS.md` | CLAUDE.md + output-style 合并生成（Codex CLI 用） |

### AGENTS.md 生成规则

`config/AGENTS.md` = `config/CLAUDE.md` 全文 + `output-styles/abyss-cultivator.md` 全文拼接。每次更新 CLAUDE.md 或 output-style 后需重新生成。

## 设计决策

### 1. 安装方式选择

| 方案 | 优点 | 缺点 | 决策 |
|------|------|------|------|
| Shell 脚本 | 无依赖、跨平台 | 功能有限 | ❌ 已移除 |
| Python 安装器 | 功能强大 | 需要 Python 环境 | ❌ 放弃 |
| npm 包 | 生态成熟 | 需要 Node.js | ✅ 采用 |

**取舍说明**：选择 npm 包（npx code-abyss），在安装便捷性和生态成熟度上取得平衡。

### 2. Skills 实现语言

选择 Python 实现 skills：
- Claude Code 环境通常有 Python
- 跨平台兼容性好
- 便于扩展和维护

### 3. 配置文件位置

根据目标 CLI 选择配置文件：
- Claude Code CLI：`~/.claude/CLAUDE.md`
- Codex CLI：`~/.codex/AGENTS.md`

安装脚本通过 `--target claude|codex`（或交互选择）确定写入位置，确保用户级配置不污染项目目录。

### 4. 备份策略

安装时自动备份现有配置：
- 备份到 `{目标目录}/.sage-backup/`（即 `~/.claude/.sage-backup/` 或 `~/.codex/.sage-backup/`）
- 通过 manifest 记录备份清单
- 避免用户数据丢失

## 技术债记录

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

### v1.7.1 设计决策

#### 1. 命令注入修复

- 问题：`npm install -g @cometix/ccline` 无版本锁定（供应链风险）；`git ${args}` 模板字符串拼接（注入风险）。
- 决策：npm 安装锁定主版本 `@1`；git 命令改用字符串拼接避免模板注入。
- 取舍：锁定主版本而非精确版本，平衡安全与可维护性。

#### 2. 共享库提取 (`skills/tools/lib/shared.js`)

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
