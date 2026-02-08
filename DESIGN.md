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
