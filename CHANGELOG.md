# Changelog

All notable changes to this project will be documented in this file.

## [2.0.1] - 2026-03-23

### Added
- 新增共享 skill registry（`bin/lib/skill-registry.js`），统一扫描 `skills/**/SKILL.md` frontmatter，产出标准化 metadata、分类信息与脚本入口。
- 新增 `bin/verify-skills-contract.js` 与 `npm run verify:skills`，把 skill contract 验证提升为显式 CI gate。
- 新增 fixture-driven contract 覆盖：重复 skill name、frontmatter 解析失败、缺少必填字段、非法 `allowed-tools`、多脚本入口都会直接阻断。
- 新增 `test/run-skill.test.js`，覆盖脚本执行、未知 skill、无脚本 skill、锁等待释放等关键回归点。
- 新增 Claude / Codex 双端生成一致性与 install smoke 回归断言。

### Changed
- `bin/install.js` 改为消费共享 registry；Claude commands 与 Codex prompts 现在严格从同一 invocable skill 集合同源生成，并基于 `runtimeType` 区分脚本型与知识型 skill。
- `skills/run_skill.js` 收窄为脚本型 skill 执行器：只负责 registry 解析、锁控制、spawn 子进程与退出码透传。
- `skills/run_skill.js` 锁等待由 busy wait 改为异步轮询，保留目标锁语义与超时策略。
- README / DESIGN / `skills/SKILL.md` 同步修正为当前真实实现：frontmatter 单源、`category/runtimeType` 切分、fail-fast 校验、Node.js 脚本 skill、CI/smoke 覆盖范围，并明确 registry public surface 已移除 `kind` 与 kebab-case compatibility 镜像字段，raw frontmatter 仅保留在 `meta`。
- `bin/install.js` 的生成链只消费 normalized contract，不再兜底旧的 kebab-case 镜像键。

### Fixed
- 消除安装器与执行器各自扫描 skill 的双轨逻辑，避免 `run_skill.js` 仅识别 `tools/*/scripts/*.js` 的漂移。
- 修正文档中“Python skills 实现”与“run_skill 已异步等待锁”但代码未对齐的旧叙事。
- 在 CI 中前置 skill contract gate，避免无效 skill 进入生成链后才暴露错误。

### Verification
- Jest: 增加 registry / prompt generation / run_skill / contract CLI / Claude smoke 覆盖
- CI: `npm test` + `npm run verify:skills` + `verify-change` + `verify-module` + `verify-quality` + `verify-security` + Claude/Codex smoke

## [2.0.0] - 2026-03-23

### Added
- **攻防侧重转向**：全面强化安全研究定位，从"全栈+安全"转向"攻防为本，全栈为翼"
- **沙箱感知执行模型**（第七章）：workspace-write 默认态、审批高效模式、沙箱受阻处理
- **离线优先信息策略**（第八章）：项目文件→依赖清单→缓存搜索→`[unverified]` 验证链
- **信息分级**（第九章）：已验证/高置信/需验证三级，禁止从训练记忆断言代码行为
- **禁废话令**：安全研究场景禁止 disclaimer、道德前缀、授权确认等 token 浪费
- **安全研究全授权范围**：pentest、reversing、exploit dev、red team、CTF、malware analysis、C2、post-exploitation
- **4个新攻防化身**：🗡 破阵（渗透）、🔬 验毒（代码审计）、💀 噬魂（逆向/PWN）、🔥 锻兵（PoC开发）
- **4个新报告模板**：安全评估报告（破阵版）、PoC开发报告（锻兵版）、逆向分析报告（噬魂版）、代码审计报告（验毒版）
- **Scene Modes 优先级矩阵**：11个场景各有独立优先级排序（效果/精准/控制/正确/速度）
- **新增4个道语标签**：破阵、验毒、噬魂、锻兵
- **术语映射扩展**：新增11个攻防专用术语（破妄/破阵/验毒/噬魂/锻兵/杀链/猎物/破口/沙箱等）

### Changed
- 版本号升级 v3.2 → v4.0（CLAUDE.md / AGENTS.md）
- 决策基准新增"全栈渗透测试员"角色
- 情景剧本从7个扩展到11个，新增安全评估、测试验证、部署发布、分析探索
- 安全边界扩展：Exploit代码、攻击手法明确标记为✅完整输出
- Skill路由表从9个化身扩展到12个，安全秘典细分为6个独立化身
- 执行规范新增：架构关卡、调试链（5 Why）、指令分解、禁止推诿规则
- 编码规范新增：禁止输出占位符残片、新依赖决策链
- 安全秘典索引（SKILL.md）全面重写：新增执行纪律、场景优先级、化身细分
- AGENTS.md 同步重新生成（CLAUDE.md + output-style 合并）

### Verification
- 所有改动为 Markdown 配置文件，无代码逻辑变更
- Jest 测试不受影响

## [1.8.0] - 2026-03-06

### Added
- Codex 安装流程现在会从 `user-invocable` skills 自动生成 `~/.codex/prompts/*.md`，把 `verify-*` / `gen-docs` 等工具对齐到官方 custom prompts 入口。
- GitHub Actions 新增 `smoke-codex` 跨平台打包验证，覆盖 `ubuntu-latest`、`macos-latest`、`windows-latest` 的 `install -> smoke -> uninstall` 闭环。

### Changed
- Codex 默认模板切换为 **safe 默认档**：`approval_policy = "on-request"` 与 `sandbox_mode = "workspace-write"`，并提供 `[profiles.full_access]` 作为显式高自动化档。
- README 与安装内容说明同步更新：补充 `prompts/`、`settings.json` 迁移行为、`full_access` profile 用法，以及当前 Codex 配置风格说明。

### Fixed
- Codex 目标不再写入伪配置 `~/.codex/settings.json`；若检测到 legacy 文件，会在安装时备份移除、卸载时恢复。
- `projects.*.trust_level` 仅在 `danger-full-access` 配置下才会被清理，避免 `workspace-write` 场景误删。

### Verification
- Jest: **8 suites / 120 tests passed**
- Targeted regression: `npm test -- --runInBand test/install.test.js test/codex.test.js`
- Package smoke: `npm pack` + `npx --package ./code-abyss-1.8.0.tgz code-abyss --target codex -y` + uninstall pass

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
