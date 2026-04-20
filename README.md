# Code Abyss

Code Abyss 是一个面向 `Claude Code`、`Codex CLI`、`Gemini CLI` 的安装器与运行时装配仓库。它不是单纯的提示词集合，而是把 persona、output styles、skills、packs、安装脚本与验证链整理成一套可安装、可测试、可维护的分发系统。

## 项目解决什么问题

- 把统一的人格与执行规则安装到不同 AI CLI。
- 把风格、技能、pack 扩展拆成清晰的可维护层。
- 用测试与 schema 约束，避免文档、安装行为、运行时结构长期漂移。

## 先建立正确心智模型

这个仓库主要由 5 层组成：

| 层 | 目录 / 文件 | 作用 |
| --- | --- | --- |
| Persona | `config/personas/` | 定义角色底稿与长期行为约束 |
| Output Style | `output-styles/` | 定义不同输出风格与 style registry |
| Skills | `skills/` | 定义知识型 skill 与脚本型 tool |
| Installer / Runtime | `bin/` | 安装、卸载、生成命令、同步 pack |
| Packs | `packs/` + `.code-abyss/packs.lock.json` | 管理核心包与外部扩展运行时 |

如果你是第一次接手这个项目，先不要从某个脚本函数开始钻。先读完这份 README，再看 [docs/ONBOARDING.md](docs/ONBOARDING.md) 与 [DESIGN.md](DESIGN.md)。

## 作为使用者，怎么安装

### 查看可用风格与人格

```bash
npx code-abyss --list-styles
npx code-abyss --list-personas
```

### 交互式安装

```bash
npx code-abyss
```

### 直接安装到指定目标

```bash
npx code-abyss --target claude -y
npx code-abyss --target codex -y
npx code-abyss --target gemini -y
```

### 指定风格 / 人格

```bash
npx code-abyss --target claude --style abyss-cultivator --persona abyss -y
npx code-abyss --target codex --style scholar-classic --persona scholar -y
npx code-abyss --target gemini --style iron-dad-warm --persona iron-dad -y
```

### 卸载

```bash
npx code-abyss --uninstall claude
npx code-abyss --uninstall codex
npx code-abyss --uninstall gemini
```

## 作为维护者，第一天该做什么

### 1. 安装依赖并跑基础验证

```bash
npm ci
npm test
npm run verify:skills
```

### 2. 理解仓库入口

- 安装入口：`bin/install.js`
- Pack 入口：`bin/packs.js`
- Skill 单一事实源：`skills/**/SKILL.md`
- Style / Persona registry：`output-styles/index.json`、`config/personas/index.json`

### 3. 按顺序读文档

1. [docs/ONBOARDING.md](docs/ONBOARDING.md)
2. [DESIGN.md](DESIGN.md)
3. [docs/PACK_SYSTEM.md](docs/PACK_SYSTEM.md)
4. [docs/SKILL_AUTHORING.md](docs/SKILL_AUTHORING.md)

## 安装后会落地什么

| 目标 | 主要产物 | 说明 |
| --- | --- | --- |
| Claude | `~/.claude/CLAUDE.md`、`output-styles/`、`commands/`、`skills/`、`settings.json` | Claude 通过 slash commands 与 `outputStyle` 使用运行时 |
| Codex | `~/.codex/config.toml`、`instruction.md`、`AGENTS.md`、`skills/` | Codex 走 skills-first 运行形态，pack runtime 还会同步到 `~/.agents/skills/` |
| Gemini | `~/.gemini/GEMINI.md`、`commands/*.toml`、`skills/`、`settings.json` | Gemini 通过 `GEMINI.md` 与 TOML commands 组合运行 |

## 常用开发命令

```bash
node bin/install.js --help
node bin/install.js --list-styles
node bin/install.js --list-personas

npm test
npm run verify:skills

npm run packs:check
npm run packs:diff
npm run packs:report -- summary
npm run packs:bootstrap -- --apply-docs
```

## 仓库结构速览

```text
bin/                 安装器、pack CLI、shared libraries
config/              基础 persona、示例配置、运行时模板
docs/                维护文档、schema、onboarding
output-styles/       风格模板与 registry
packs/               core / external pack manifests
skills/              知识型与脚本型 skills
test/                Jest 回归与 smoke tests
.code-abyss/         项目级 pack lock、reports、snippets
```

## 文档地图

| 文档 | 适合谁 | 解决什么问题 |
| --- | --- | --- |
| [docs/README.md](docs/README.md) | 所有维护者 | 从哪里开始读、每份文档有什么用 |
| [docs/ONBOARDING.md](docs/ONBOARDING.md) | 新接手同学 | 第一天如何跑通、如何定位目录和命令 |
| [DESIGN.md](DESIGN.md) | 设计 / 架构维护者 | 系统分层、关键设计决策、边界 |
| [CLAUDE.md](CLAUDE.md) | Repo-aware agent / 维护者 | 快速规则、命令、源码入口 |
| [docs/PACK_SYSTEM.md](docs/PACK_SYSTEM.md) | 维护 packs 的人 | pack lock、vendor、report、bootstrap |
| [docs/PACK_MANIFEST_SCHEMA.md](docs/PACK_MANIFEST_SCHEMA.md) | 新增第三方 pack 的人 | manifest 字段契约 |
| [docs/PACKS_LOCK_SCHEMA.md](docs/PACKS_LOCK_SCHEMA.md) | 调整项目 pack 策略的人 | `packs.lock` 结构与约束 |
| [docs/SKILL_AUTHORING.md](docs/SKILL_AUTHORING.md) | 新增 / 修改 skill 的人 | `SKILL.md` frontmatter 与脚本约束 |

## 修改代码前的建议

- 改 skill，先看 [docs/SKILL_AUTHORING.md](docs/SKILL_AUTHORING.md)。
- 改安装流程，先看 [DESIGN.md](DESIGN.md) 与 `test/install-smoke.test.js`。
- 改 pack，同步看 [docs/PACK_SYSTEM.md](docs/PACK_SYSTEM.md)、`packs/*/manifest.json`、`.code-abyss/packs.lock.json`。
- 改文档，不要手写容易漂移的数量统计，优先写结构、流程与事实源。

## 发布前最小检查

```bash
npm test
npm run verify:skills
npm run packs:check
```

如果这次改动涉及文档、安装结构或 pack 行为，再补：

```bash
npm run packs:diff
npm run packs:report -- summary
```

## 补充说明

- 这个仓库已经从 legacy Codex prompts 形态迁移出来，维护时应以 `config.toml`、`instruction.md`、`AGENTS.md`、`skills/` 与 `~/.agents/skills/` 为准。
- 文档中的实现描述，默认以源码与测试为准；若文档与行为冲突，先修文档，再补回归测试。