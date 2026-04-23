# CLAUDE.md

本文件面向在仓库内工作的 repo-aware agent 与维护者。目标只有一个：让后来接手的人不用靠猜。

## 项目概览

Code Abyss 是一个多目标 AI CLI 安装器，负责把 persona、output styles、skills 与 optional packs 安装到：

- `Claude Code`
- `Codex CLI`
- `Gemini CLI`

仓库不是“文档仓”或“提示词仓”，而是一个带测试、schema、runtime 约束的安装分发仓。

## 先看哪些文件

### 入口

- `bin/install.js`
- `bin/packs.js`
- `bin/adapters/claude.js`
- `bin/adapters/codex.js`
- `bin/adapters/gemini.js`

### 单一事实源

- `skills/**/SKILL.md`
- `output-styles/index.json`
- `config/personas/index.json`
- `packs/*/manifest.json`
- `.code-abyss/packs.lock.json`

### 回归测试

- `test/install-smoke.test.js`
- `test/style-registry.test.js`
- `test/pack-registry.test.js`
- `test/packs-cli.test.js`
- `test/docs-drift.test.js`

## 常用命令

```bash
npm test
npm run verify:skills

node bin/install.js --help
node bin/install.js --list-styles
node bin/install.js --list-personas

npm run packs:check
npm run packs:diff
npm run packs:report -- summary
```

## 修改时的规则

### 改 skill

- 修改 `skills/**/SKILL.md` 时，把 frontmatter 当作唯一元数据入口。
- 如果是脚本型 skill，只允许一个 `scripts/*.js` 入口。
- 改完至少跑 `npm run verify:skills`。

### 改 style / persona

- style registry 在 `output-styles/index.json`
- persona registry 在 `config/personas/index.json`
- 改 registry 时同步确认默认项只有一个
- 改完至少跑 `test/style-registry.test.js`

### 改安装流程

- 优先读 `bin/install.js` 的 orchestration，再读 target adapter
- 不要凭文档猜目标目录，以 target registry、manifest、smoke tests 为准
- 涉及 Claude / Codex / Gemini 产物变化时，回看 `test/install-smoke.test.js`

### 改 pack

- `packs/*/manifest.json` 描述 pack 契约
- `.code-abyss/packs.lock.json` 描述项目级启用策略
- `bin/packs.js` 管 bootstrap、vendor、report、uninstall
- 改完至少跑 `npm run packs:check`

### 改文档

- 不要手写容易漂移的技能数量、历史入口数量
- 文档中的路径、命令、生成物必须能在源码或测试里找到对应依据
- `README.md`、`DESIGN.md`、`docs/*.md` 改动后，至少跑 `test/docs-drift.test.js`

## 当前实现口径

- Claude：写入 `~/.claude/CLAUDE.md`、`commands/`、`skills/`、`settings.json`
- Codex：写入 `~/.codex/config.toml`、`instruction.md`、`AGENTS.md`、`skills/`，pack runtime 可写入 `~/.agents/skills/`
- Gemini：写入 `~/.gemini/GEMINI.md`、`commands/*.toml`、`skills/`、`settings.json`

## 文档阅读顺序

1. `README.md`
2. `docs/ONBOARDING.md`
3. `DESIGN.md`
4. `docs/PACK_SYSTEM.md`
5. `docs/SKILL_AUTHORING.md`

## 一句判断标准

如果一个新人读完 README 和 onboarding 之后，依旧不知道应该先跑什么命令、看什么文件、怎样验证改动，这份文档就是不合格的。