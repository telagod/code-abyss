# Manual Import Guide / 手动导入指南

## 1. Goal / 使用目标

**中文**

这个目录是一个可搬运的个人 SKILL 包。你可以：

1. 整个复制 `personal-skill-system/` 作为你的私有 skill 仓。
2. 只挑某个 skill 文件夹，手动复制到 Codex 或 Claude 的 skills 目录。
3. 如果宿主只支持文本粘贴，则直接粘贴某个 `SKILL.md` 的全部内容。

**English**

This directory is a portable personal skill bundle. You can:

1. copy the whole `personal-skill-system/` folder as your private skill repository
2. copy only selected skill folders into Codex or Claude
3. paste a single `SKILL.md` directly when the host only supports text-based custom skills

## 2. Folder Meaning / 目录含义

**中文**

- `docs/`: 使用说明、蓝图、覆盖审计
- `registry/`: schema、route map、host capability 示例
- `skills/`: 真正可导入的 skill
- `packs/`: 分层分发示例
- `templates/`: 后续新增 skill 的样板

**English**

- `docs/`: usage docs, blueprint, and coverage audit
- `registry/`: schema, route map, and host capability examples
- `skills/`: the actual importable skills
- `packs/`: pack layering examples
- `templates/`: starter templates for new skills

## 3. What To Import / 应该导入什么

### 3.1 If You Want The Minimum Set / 如果你只想要最小可用集

**中文**

优先导入这四类：

1. `skills/routers/sage/`
2. 你常用的 `skills/domains/*/`
3. 至少一个 workflow，例如 `skills/workflows/bugfix/`
4. 至少一个 tool，例如 `skills/tools/verify-change/`

**English**

Start with these four categories:

1. `skills/routers/sage/`
2. the domains you use most from `skills/domains/*/`
3. at least one workflow, such as `skills/workflows/bugfix/`
4. at least one tool, such as `skills/tools/verify-change/`

### 3.2 If You Want A More Complete Set / 如果你想要更完整的集合

**中文**

推荐顺序：

1. `skills/routers/sage/`
2. 全部 `skills/domains/`
3. 全部 `skills/workflows/`
4. 全部 `skills/tools/`
5. 全部 `skills/guards/`

**English**

Recommended order:

1. `skills/routers/sage/`
2. all `skills/domains/`
3. all `skills/workflows/`
4. all `skills/tools/`
5. all `skills/guards/`

## 4. Codex Usage / 如何用于 Codex

### 4.1 Folder Import / 文件夹导入

**中文**

如果 Codex 支持本地 skills 目录，优先复制整个 skill 文件夹，而不是只复制 `SKILL.md`。

示例：

```text
personal-skill-system/skills/tools/verify-change/
```

把这个整个目录复制到你自己的 Codex skills 根目录下。

**English**

If Codex supports local skill directories, copy the whole skill folder instead of only `SKILL.md`.

Example:

```text
personal-skill-system/skills/tools/verify-change/
```

Copy the entire directory into your own Codex skills root.

### 4.2 Text Paste Import / 文本粘贴导入

**中文**

如果你的 Codex 环境只给你一个文本输入框：

1. 打开目标 skill 的 `SKILL.md`
2. 全文复制
3. 粘贴到 Codex 的 custom skill 或 system-like skill 输入位置

此时：

- `router/domain/workflow` 类型通常只靠 `SKILL.md` 就能工作
- `tool/guard` 类型如果没有配套 `scripts/`，就只能作为“规范说明”而不是“真实执行器”

**English**

If your Codex environment only gives you a text box:

1. open the target `SKILL.md`
2. copy the full contents
3. paste it into the Codex custom skill field

In that mode:

- `router/domain/workflow` skills usually work from `SKILL.md` alone
- `tool/guard` skills become policy/instruction skills unless you also bring their `scripts/`

## 5. Claude Usage / 如何用于 Claude

### 5.1 Paste-Only Mode / 纯粘贴模式

**中文**

Claude 通常更适合直接粘贴 `SKILL.md`。建议：

1. 先粘贴 `skills/routers/sage/SKILL.md`
2. 再补贴你需要的 domain 和 workflow
3. 最后按需补贴 tool/guard

**English**

Claude often works well with direct `SKILL.md` pasting. Recommended order:

1. paste `skills/routers/sage/SKILL.md`
2. add the domains and workflows you need
3. add tools/guards only when necessary

### 5.2 Folder Mode / 文件夹模式

**中文**

如果 Claude 环境支持文件式 skills，同样建议复制整个 skill 文件夹，尤其是：

- `skills/tools/*`
- `skills/guards/*`

因为这些目录自带 `scripts/` stub，后续你可以继续扩展。

**English**

If Claude supports file-based skills, copy the entire folder, especially for:

- `skills/tools/*`
- `skills/guards/*`

Those folders already contain script stubs that you can expand later.

## 6. How Internal Invocation Works / 内部如何决定是否调用

**中文**

这套 bundle 的假设是：

1. `sage` 是总路由
2. 其他 skill 是子能力
3. 宿主模型会根据 `name`、`description`、trigger 词和正文规则，内部决定是否调用该 skill

也就是说，它不是 CLI 命令菜单，而是一套“结构化能力说明书”。

**English**

This bundle assumes:

1. `sage` is the root router
2. the other skills are child capabilities
3. the host model decides internally whether to invoke a skill based on `name`, `description`, trigger keywords, and body rules

In other words, this is not just a slash-command menu. It is a structured capability system.

## 7. Recommended Import Profiles / 推荐导入组合

### 7.1 Engineering Profile / 工程修复组合

**中文**

- `sage`
- `development`
- `security`
- `investigate`
- `bugfix`
- `verify-change`
- `verify-quality`
- `verify-security`

**English**

- `sage`
- `development`
- `security`
- `investigate`
- `bugfix`
- `verify-change`
- `verify-quality`
- `verify-security`

### 7.2 Product + UI Profile / 产品与前端设计组合

**中文**

- `sage`
- `frontend-design`
- `architecture`
- `review`
- `neubrutalism` or `glassmorphism` or `claymorphism` or `liquid-glass`

**English**

- `sage`
- `frontend-design`
- `architecture`
- `review`
- `neubrutalism` or `glassmorphism` or `claymorphism` or `liquid-glass`

### 7.3 Platform / Infra Profile / 平台与基础设施组合

**中文**

- `sage`
- `infrastructure`
- `devops`
- `ship`
- `pre-merge-gate`

**English**

- `sage`
- `infrastructure`
- `devops`
- `ship`
- `pre-merge-gate`

## 8. Important Limitation / 重要限制

**中文**

这个 bundle 现在是“portable skeleton plus seed skills”：

- 路由覆盖已经接近并部分超过原版
- 但很多 tool 的 `scripts/` 仍是 stub
- 也没有把原版所有 reference 文档、agent metadata、宿主安装链全部打包进来

请继续阅读：

- [PERSONAL_SKILL_SYSTEM_BLUEPRINT.md](./PERSONAL_SKILL_SYSTEM_BLUEPRINT.md)
- [ORIGINAL_COVERAGE_AUDIT.md](./ORIGINAL_COVERAGE_AUDIT.md)

**English**

This bundle is currently a portable skeleton plus seed skills:

- routing coverage now matches and partially exceeds the original set
- many tool `scripts/` are still stubs
- it does not yet bundle every original reference file, agent metadata file, or installer/runtime hook

Continue with:

- [PERSONAL_SKILL_SYSTEM_BLUEPRINT.md](./PERSONAL_SKILL_SYSTEM_BLUEPRINT.md)
- [ORIGINAL_COVERAGE_AUDIT.md](./ORIGINAL_COVERAGE_AUDIT.md)
- [ITERATION_HANDOFF.md](./ITERATION_HANDOFF.md)
