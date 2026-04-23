# Skill Authoring

> 适用对象：新增或维护 `personal-skill-system/skills/**/SKILL.md` 的维护者

## 这份文档解决什么问题

skill 是 Code Abyss 最容易扩展、也最容易漂移的部分。这里定义的不是“写作建议”，而是仓库当前真正执行的 contract。

## 先记住一句话

`personal-skill-system/skills/**/SKILL.md` frontmatter 是 skill metadata 的唯一事实源。

命令生成、registry 扫描、脚本执行、CI 合约校验，都应该从这里出发。

## 最小模板

```yaml
---
name: verify-quality
description: Code quality gate
user-invocable: true
allowed-tools: Bash, Read, Glob
argument-hint: <scan-path>
aliases: vq
---
```

## frontmatter 字段

### 必填字段

| 字段 | 说明 |
| --- | --- |
| `name` | kebab-case，且在所有 skills 中唯一 |
| `description` | 非空描述，给用户和命令生成使用 |
| `user-invocable` | `true` / `false`，决定是否对外暴露 |

### 可选字段

| 字段 | 说明 |
| --- | --- |
| `allowed-tools` | 逗号分隔；缺省时默认 `Read` |
| `argument-hint` | 给命令生成与帮助文案用 |
| `aliases` | 逗号分隔的附加命令名 |

## 运行时推断规则

仓库会基于目录结构自动推断两类信息。

### `category`

由目录前缀推断：

- `personal-skill-system/skills/tools/*` -> `tool`
- `personal-skill-system/skills/domains/*` -> `domain`
- `personal-skill-system/skills/orchestration/*` -> `orchestration`
- 其他 -> `root`

### `runtimeType`

由 `scripts/` 目录推断：

- 恰好一个 `scripts/*.js` -> `scripted`
- 没有脚本入口 -> `knowledge`

## 脚本型 skill 的约束

- 只能有一个 `scripts/*.js` 入口
- 实际执行入口统一通过 `<skill-rel-path>/scripts/run.js`
- 不要在命令生成层直接绕过 registry 去调用脚本

## 知识型 skill 的约束

- 没有脚本入口
- 只提供给模型读取 `SKILL.md`
- 适合放领域知识、流程约束、路由规则

## 失败即中断的校验项

这些问题会直接让 `collectSkills()`、`npm run verify:skills` 和 CI 失败：

- frontmatter 不能被解析
- 缺少必填字段
- `name` 不是合法 kebab-case
- `allowed-tools` 含非法工具名
- skill name 重复
- `scripts/` 下出现多个 `.js` 入口

## 作者工作流

### 新增一个知识型 skill

1. 创建 `personal-skill-system/skills/<category>/<skill-name>/SKILL.md`
2. 写好 frontmatter 与正文
3. 跑：

```bash
npm run verify:skills
npm test -- --runInBand test/install-generation.test.js
```

### 新增一个脚本型 skill

1. 创建 `personal-skill-system/skills/<category>/<skill-name>/SKILL.md`
2. 新增 `scripts/<entry>.js`
3. 确认 `scripts/` 下只有一个 `.js`
4. 跑：

```bash
npm run verify:skills
npm test -- --runInBand test/run-skill.test.js test/install-generation.test.js
```

## 改动后至少要验证什么

| 改动 | 最低验证 |
| --- | --- |
| frontmatter 字段 | `npm run verify:skills` |
| 命令生成 | `test/install-generation.test.js` |
| 脚本执行 | `test/run-skill.test.js` |
| 安装产物 | `test/install-smoke.test.js` |

## 写 skill 时最容易踩的坑

### 把正文当成元数据事实源

不行。可执行链只认 frontmatter，不会解析你正文里写的额外说明。

### 一个 skill 放多个脚本入口

不行。当前 contract 要求脚本型 skill 只能有一个入口。如果需要多个动作，应在一个入口里自行分发，或者拆成多个 skill。

### 忘记考虑 `user-invocable`

如果你希望它出现在生成命令里，必须显式写 `user-invocable: true`。

## 什么时候需要补文档

只要你改了下面这些内容，就应该同步回看 README / onboarding / 相关专题文档：

- 新增对外可见 skill
- 变更 skill 使用方式
- 改动 `allowed-tools` 或参数形态
- 调整 registry 推断规则

## 相关文档

- [ONBOARDING.md](./ONBOARDING.md)
- [../README.md](../README.md)
- [../DESIGN.md](../DESIGN.md)
