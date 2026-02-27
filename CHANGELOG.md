# Changelog

All notable changes to this project will be documented in this file.

## [1.7.7] - 2026-02-27

### Fixed
- 修复 Codex 配置补全时的 TOML 分块问题：root 参数（如 `approval_policy`、`sandbox_mode`）现在会写入首个 section 之前，不再误拼到 table 内导致不生效。
- 新增错层参数清理逻辑：自动移除非 root section 内误写的 root 键，避免“有配置但无效”。
- 当 `sandbox_mode = "danger-full-access"` 时，自动清理 `projects.*.trust_level` 段，减少冗余 trusted 项干扰。

### Changed
- `README` 兼容性说明同步更新：明确包含 root 分块修复与 full access 下 trust 清理行为。

### Verification
- Jest: **8 suites / 118 tests passed**

## [1.7.6] - 2026-02-27

### Changed
- 强化 Codex 多 Agent 协同提示词链路：在 `CLAUDE.md` / `AGENTS.md` 增加执行闭环与硬约束（文件所有权、awaiter 长任务、close_agent 回收）。
- `skills/orchestration/multi-agent/SKILL.md` 与 `skills/domains/orchestration/multi-agent.md` 新增 Codex 原生动作映射与强约束模板（Worker/Reviewer/Lead）。
- `skills/domains/orchestration/SKILL.md` 增加 Codex 多 Agent 强化要点，统一路由时的执行规范。

### Verification
- Jest: **8 suites / 115 tests passed**

## [1.7.5] - 2026-02-27

### Changed
- Codex 安装流程在检测到已有 `~/.codex/config.toml` 时，自动执行配置维护：补齐默认项、清理 removed features、迁移 deprecated `web_search_*` 到 `[tools].web_search`。
- README 兼容性说明同步更新为“自动补全 + 清理 + 迁移”。

### Added
- `bin/adapters/codex.js` 新增 legacy 配置清理与迁移逻辑（`cleanupLegacyCodexConfig`、`patchCodexConfig`）。
- `test/codex.test.js` 新增针对 removed/deprecated feature 处理与迁移行为的回归测试。

### Verification
- Jest: **8 suites / 115 tests passed**

## [1.7.4] - 2026-02-23

### Added
- 增加 provider 适配层目录 `bin/adapters/`，分离 Claude/Codex 逻辑。
- 增加适配器单元测试：`test/claude.test.js`、`test/codex.test.js`。
- README 增加 Codex `config.toml` 推荐模板与兼容性说明。

### Changed
- `bin/install.js` 降维为编排层，调用 adapters 处理 provider 专属流程。
- Codex 模板更新为新版键风格：
  - 使用 `[tools].web_search = true`
  - 使用 `[features].multi_agent = true`
  - 移除旧字段（如 `model_reasoning_summary`、`model_personality`、旧 `web_search` 写法等）。
- `gen-docs` 脚本导出 API 并增加 `require.main` 保护，测试调用方式更稳定。

### Fixed
- 修复 `test/gen-docs.test.js` 在子进程环境下返回 JSON 不稳定导致的回归失败。
- 完成安装/卸载端到端回归验证（Claude + Codex 双目标）。

### Verification
- Jest: **8 suites / 108 tests passed**
- Quality check: pass
- Security scan: pass (无严重/高危/中危)
- npm package dry-run: pass
