# Original Coverage Audit / 原版覆盖核查

## 1. Audit Result / 核查结论

**中文**

你的直觉是对的，但只对了一半。

- 在吾第一次生成时，portable bundle 的确少于原版
- 现在吾已补齐主要缺口，数量上已经超过原版
- 但“内容深度”依然薄于原版，所以你仍会感觉它不够厚实

**English**

Your instinct was right, but only half right.

- in the first generated version, the portable bundle was indeed smaller than the original
- now the main missing categories have been added back, and the count exceeds the original
- however, the content depth is still thinner than the original, so it can still feel lighter

## 2. Count Comparison / 数量对比

| Bundle | Skill Count |
| --- | ---: |
| original `skills/` | 21 |
| current `personal-skill-system/skills/` | 28 |

## 3. What Was Missing Before / 之前缺了什么

**中文**

第一次生成时，缺失或未映射完整的主要项有：

- `data-engineering`
- `infrastructure`
- `mobile`
- `orchestration`
- `multi-agent`
- 前端四个设计变体

**English**

The first portable version was missing or under-mapped in these areas:

- `data-engineering`
- `infrastructure`
- `mobile`
- `orchestration`
- `multi-agent`
- the four frontend design variants

## 4. What Is Now Covered / 现在已经覆盖什么

### 4.1 Original Root / 原版根路由

- original: `skills/SKILL.md`
- portable mapping: `skills/routers/sage/SKILL.md`

### 4.2 Original Domains / 原版知识域

| Original | Portable |
| --- | --- |
| `ai` | `skills/domains/ai/` |
| `architecture` | `skills/domains/architecture/` |
| `data-engineering` | `skills/domains/data-engineering/` |
| `development` | `skills/domains/development/` |
| `devops` | `skills/domains/devops/` |
| `frontend-design` | `skills/domains/frontend-design/` |
| `infrastructure` | `skills/domains/infrastructure/` |
| `mobile` | `skills/domains/mobile/` |
| `orchestration` | `skills/domains/orchestration/` |
| `security` | `skills/domains/security/` |

### 4.3 Original Frontend Variants / 原版前端变体

| Original | Portable |
| --- | --- |
| `claymorphism` | `skills/domains/frontend-design/variants/claymorphism/` |
| `glassmorphism` | `skills/domains/frontend-design/variants/glassmorphism/` |
| `liquid-glass` | `skills/domains/frontend-design/variants/liquid-glass/` |
| `neubrutalism` | `skills/domains/frontend-design/variants/neubrutalism/` |

### 4.4 Original Multi-Agent Capability / 原版多 Agent 能力

**中文**

原版把它放在 `skills/orchestration/multi-agent/`。portable bundle 为了服从新的目录设计，把它映射为：

- `skills/workflows/multi-agent/`

**English**

The original kept it at `skills/orchestration/multi-agent/`.
To fit the new layer model, the portable bundle maps it to:

- `skills/workflows/multi-agent/`

### 4.5 Original Tools / 原版工具类

| Original | Portable |
| --- | --- |
| `gen-docs` | `skills/tools/gen-docs/` |
| `verify-module` | `skills/tools/verify-module/` |
| `verify-change` | `skills/tools/verify-change/` |
| `verify-quality` | `skills/tools/verify-quality/` |
| `verify-security` | `skills/tools/verify-security/` |

## 5. What Portable Adds Beyond The Original / portable 额外新增了什么

**中文**

为了让它更像“个人 skill 体系”而不是“原版的薄拷贝”，吾额外加入了：

- `workflows/investigate`
- `workflows/bugfix`
- `workflows/review`
- `workflows/architecture-decision`
- `workflows/ship`
- `guards/pre-commit-gate`
- `guards/pre-merge-gate`
- `registry/` schema 与 route map
- `packs/` layering 示例
- `templates/` skill 样板

**English**

To make it a personal skill system instead of a thin clone, the bundle adds:

- `workflows/investigate`
- `workflows/bugfix`
- `workflows/review`
- `workflows/architecture-decision`
- `workflows/ship`
- `guards/pre-commit-gate`
- `guards/pre-merge-gate`
- `registry/` schemas and route map
- `packs/` layering examples
- `templates/` starter templates

## 6. Why It Still Feels Lighter / 为什么它仍然感觉更轻

**中文**

这不是数量问题，而是“厚度问题”。当前 portable bundle 仍然比原版薄，主要因为：

1. 原版很多 domain skill 背后还有更多细分 markdown 参考文件
2. 原版 tools 是真实实现，而这里很多 `scripts/` 仍是 stub
3. 原版部分 skill 带 `agents/openai.yaml` 等 host metadata，这里没全带
4. 原版和安装器、registry、runner 是联动的，这里是手动导入优先

**English**

This is no longer a count problem. It is a depth problem. The portable bundle still feels lighter because:

1. many original domains are backed by richer reference markdown files
2. the original tools are real implementations, while many scripts here are still stubs
3. some original skills include host metadata such as `agents/openai.yaml`, which is not fully bundled here
4. the original system is wired into installer/registry/runner flows, while this bundle is optimized for manual import

## 7. Practical Verdict / 实战判词

**中文**

- 如果你的目标是“手工拷贝到 Codex / Claude 并让它内部判断是否调用”，现在这套已经够用
- 如果你的目标是“完整复刻原版能力密度”，现在这套还不够，需要继续补 reference、真实脚本与 host metadata

**English**

- if your goal is to manually copy skills into Codex or Claude and let the model decide internally when to use them, this bundle is already usable
- if your goal is to fully replicate the original skill density, this bundle still needs more references, real scripts, and host metadata
