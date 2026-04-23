# DESIGN.md

## 文档目的

这份文档解释 Code Abyss 的系统设计、事实源、安装模型与关键取舍。它不是 changelog，也不是营销介绍，而是给维护者建立稳定心智模型用的。

## 一句话架构

Code Abyss 把 persona、style、skill、pack 四类配置分层管理，再通过统一安装器装配到不同 AI CLI 的运行时目录。

## 系统目标

- 用一套仓库同时支持 Claude、Codex、Gemini。
- 保持可组合：persona 与 style 可以独立演化。
- 保持可验证：skill、style、pack 都有 registry 或 schema 约束。
- 保持可维护：目标差异尽量收敛到 adapter，而不是散落在安装脚本各处。

## 分层设计

| 层 | 事实源 | 产出 |
| --- | --- | --- |
| Persona | `config/personas/*` + `config/personas/index.json` | 基础角色设定 |
| Output Style | `output-styles/*` + `output-styles/index.json` | 表达风格与目标适配 |
| Skills Source | `personal-skill-system/skills/**/SKILL.md` + `scripts/*.js` | 权威 skill source、脚本型 tool、命令生成输入 |
| Packs | `packs/*/manifest.json` + `.code-abyss/packs.lock.json` | 核心运行时与第三方扩展 runtime |
| Installer | `bin/install.js` + `bin/adapters/*` | 实际安装、备份、清理、后处理 |

## 关键运行时形态

### Claude

- 基础人格文件：`~/.claude/CLAUDE.md`
- 输出风格目录：`~/.claude/output-styles/`
- skills：`~/.claude/skills/`
- 生成命令：`~/.claude/commands/*.md`
- 用户设置：`~/.claude/settings.json`

### Codex

Codex 当前是 `skills-only` / `skills-first` 形态：能力入口以 skills runtime 为主，而不是 legacy prompts。

实际安装产物包括：

- `~/.codex/config.toml`
- `~/.codex/instruction.md`
- `~/.codex/AGENTS.md`
- `~/.agents/skills/`（Codex skill runtime 主入口，含 pack runtime，如 gstack）
- `~/.codex/skills/`（core skills 兼容镜像，非主入口）

这里有三个事实必须同时记住：

1. Codex 已不再依赖 legacy `prompts/` 目录。
2. Codex runtime 入口以 `~/.agents/skills/` 为准，而非 repo root `skills/`。
3. 安装阶段仍会写入 `AGENTS.md`，用于组合 persona 与 style 的运行时 guidance。

### Gemini

- `~/.gemini/GEMINI.md`
- `~/.gemini/settings.json`
- `~/.gemini/commands/*.toml`
- `~/.gemini/skills/`

## 单一事实源

### Skill 元数据

`personal-skill-system/skills/**/SKILL.md` frontmatter 是 skill metadata 的唯一事实源。命令生成、skill 校验、脚本执行都应基于同一份 frontmatter，而不是额外维护平行清单；repo root `skills/` 已退役并移除。

### Style / Persona registry

- style registry：`output-styles/index.json`
- persona registry：`config/personas/index.json`

安装器根据 registry 解析 slug、label、默认项与目标兼容性，再生成目标运行时内容。

### Pack 元数据

- pack manifest：`packs/*/manifest.json`
- project pack policy：`.code-abyss/packs.lock.json`

manifest 描述 pack 自身能装什么；lock 描述当前项目想装什么。

## 安装流程

### 1. 解析目标与参数

安装器读取：

- `--target`
- `--style`
- `--persona`
- `--yes`
- `--list-styles`
- `--list-personas`

### 2. 解析 registry

安装前会解析：

- style registry
- persona registry
- skill registry
- pack registry
- target registry

### 3. 拷贝 core runtime

核心 pack `abyss` 的静态文件由 `packs/abyss/manifest.json` 描述。不同 host 拷贝到不同根目录。

### 4. 生成动态产物

- Claude：生成 slash commands
- Codex：生成 persona + style 组合后的 `AGENTS.md`
- Gemini：生成 `GEMINI.md` 与 TOML commands

### 5. 同步 project packs

安装器会读取最近的 `.code-abyss/packs.lock.json`，决定是否装入外部 pack，例如 gstack。

### 6. 备份与清理

安装前会备份目标文件；卸载时按 manifest 与 backup manifest 回滚。Codex 还会清理 legacy `prompts/`、过期 `settings.json` 等历史残留。

## 为什么这样拆

### 决策 1：persona 与 style 分离

如果把人格和风格写死在同一份大文件里，每次想新增一个说话方式都要复制整套规则，维护成本会指数上升。分离后：

- persona 负责“做事原则”
- style 负责“怎么表达”

### 决策 2：skill frontmatter 单一事实源

曾经最容易漂移的是“文档说一套、命令生成另一套、运行器再猜一套”。现在把 skill metadata 收口到 `SKILL.md` frontmatter，减少平行配置。

### 决策 3：pack system 独立成层

核心运行时与第三方 runtime 的生命周期不同。把 pack 单独抽象出来后：

- `abyss` 可以稳定描述 core files
- `gstack` 这类外部 runtime 可以独立 pin upstream、vendor、report、uninstall

### 决策 4：adapter 隔离目标差异

Claude / Codex / Gemini 的认证、配置文件和安装后处理不同。把差异沉到 `bin/adapters/*`，能避免 `install.js` 继续膨胀成一个无法维护的条件分支中心。

## 测试与防漂移策略

| 测试 | 目的 |
| --- | --- |
| `test/install-smoke.test.js` | 验证 3 个目标的安装与卸载闭环 |
| `test/style-registry.test.js` | 验证 style / persona registry 与动态 guidance |
| `test/pack-registry.test.js` | 验证 pack manifest 与 host file mapping |
| `test/packs-cli.test.js` | 验证 pack CLI 行为 |
| `test/docs-drift.test.js` | 防止 README / DESIGN 继续写回过期叙述 |

## 当前边界

- 文档不会自动从代码完整生成，仍需要维护者手工整理叙述层。
- gstack 这类 pack 的上游内容不在本仓库直接维护范围内，但本仓库负责其安装契约与本地同步策略。
- 用户可见 CLI 文案与仓库文档属于两套表面；本次设计文档优先约束仓库事实源与安装行为。

## 维护建议

- 改 registry，就补对应测试。
- 改安装产物，就补 smoke test。
- 改文档口径，就补 drift test 或至少确保现有 drift test 不回归。
- 遇到文档与代码不一致时，以源码和测试为准，但必须把文档同步修掉。
