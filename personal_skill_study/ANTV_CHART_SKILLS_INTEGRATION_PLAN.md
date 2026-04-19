# AntV Chart Visualization Skills 融合评估与落地方案（personal_skill_study）

## 1. 判词

AntV 这套 `chart-visualization-skills` 在“图表知识深度”上很强，适合作为 `PERSONAL_SKILL_SYSTEM` 的专业能力模块；但它当前不满足你体系的治理契约（schema、route-map、registry、pack、验证链），不能直接并入主干，需要先做“标准化改造 + 路由收敛”。

## 2. 证据快照（已实测）

### 2.1 你的基线（当前 personal-skill-system）

执行：

```bash
node personal-skill-system/skills/tools/verify-skill-system/scripts/run.js --target personal-skill-system --json
```

结果：

- `status=pass`
- `skillFiles=30`
- `registrySkills=30`
- `capabilityModules=58`
- `routeEntries=29`

### 2.2 AntV 仓库按你标准扫描

执行：

```bash
node personal-skill-system/skills/tools/verify-skill-system/scripts/run.js --target ../chart-visualization-skills --json
```

结果：

- `status=fail`
- `skillFiles=6`
- `routeEntries=0`
- `capabilityModules=0`
- `66 errors + 1 warning`
- 缺失顶层目录：`docs/ registry/ packs/ templates/`
- 每个 SKILL 缺 9 个关键 frontmatter 字段（共 54 条缺失）

### 2.3 AntV 能力资产规模（静态盘点）

- `antv-g2-chart` references：`180` 文件
- `antv-s2-expert` references：`29` 文件
- 其余技能（chart API / icon / infographic / T8 narrative）以操作规范为主
- `eval/data/g2-dataset-174.json` 存在，约 `1.79MB`
- README 中 “98%+” 评测成绩为仓库声明，尚未在本地复现，标记为 `[unverified]`

## 3. 能力评估（业务价值视角）

| 能力域 | 结论 | 证据 | 融合价值 |
|---|---|---|---|
| G2 图表代码生成 | 强 | `antv-g2-chart` + 180 references | 直接补足复杂图表（mark/transform/interaction）决策深度 |
| S2 透视表开发 | 强 | `antv-s2-expert` + 知识/类型/示例分层 | 覆盖 BI 透视、多维交叉分析 |
| 可视化内容生产 | 中强 | `infographic-creator`、`narrative-text-visualization` | 支持“图+文叙事”交付链 |
| 图标检索 | 中 | `icon-retrieval` API 规范 | 对信息图素材有增益 |
| 工程治理兼容性 | 弱 | verify-skill-system 全面 fail | 需要先标准化，否则会破坏你现有路由与校验闭环 |

## 4. 与 PERSONAL_SKILL_SYSTEM 标准的核心差距

1. Frontmatter 不兼容：缺 `schema-version/kind/user-invocable/trigger-mode/priority/runtime/executor/supported-hosts/status`。
2. 治理面缺失：无 `registry.generated.json`、`route-map.generated.json`、`route-fixtures.generated.json`。
3. 目录模型不兼容：缺 `docs/registry/packs/templates`。
4. 路由面过宽风险：若直接把 6 个技能平铺进 public surface，会违反“稳定路由面 + 深引用层”的蓝图。
5. 运行依赖外部 API：`chart-visualization`、`icon-retrieval` 强依赖公网端点，需加超时、白名单和降级策略。

## 5. 推荐融合策略（薄入口 + 深模块 + 可验证）

### 5.1 路由策略

只新增一个公共域技能：`chart-visualization`，不直接把 6 个 AntV 技能全部暴露为同级路由。

原因：

- 保持 route surface 稳定，避免路由噪声。
- AntV 的强项在 references 深度，适合沉到 capability modules。
- 便于后续按任务升级为 workflow/tool，而不是先扩散入口。

### 5.2 分层落位

建议落位到 `personal-skill-system/skills/domains/chart-visualization/`：

- `SKILL.md`：薄入口（触发词、分流规则、读取顺序）
- `references/g2/*`：承接 `antv-g2-chart` 能力
- `references/s2/*`：承接 `antv-s2-expert` 能力
- `references/infographic/*`：承接 `infographic-creator`
- `references/narrative-t8/*`：承接 `narrative-text-visualization`
- `references/render-api/*`：承接 `chart-visualization` API 规范
- `references/icon/*`：承接 `icon-retrieval` 规范

## 6. AntV → personal-skill-system 映射方案

| AntV 技能 | 融合形态 | 目标位置 |
|---|---|---|
| `antv-g2-chart` | capability modules | `skills/domains/chart-visualization/references/g2/` |
| `antv-s2-expert` | capability modules | `skills/domains/chart-visualization/references/s2/` |
| `chart-visualization` | reference + 后续可脚本化 tool | `references/render-api/` |
| `infographic-creator` | reference | `references/infographic/` |
| `narrative-text-visualization` | reference | `references/narrative-t8/` |
| `icon-retrieval` | reference + 后续可脚本化 tool | `references/icon/` |

## 7. 分阶段落地计划

### Phase A：标准化接入（最小可发布）

目标：先可路由、可验证、可维护。

动作：

1. 新建 `domains/chart-visualization/SKILL.md`（schema v2 完整 frontmatter）。
2. 导入并重组 AntV references 到上述 6 个子目录。
3. 更新：
   - `personal-skill-system/registry/registry.generated.json`
   - `personal-skill-system/registry/route-map.generated.json`
   - `personal-skill-system/registry/route-fixtures.generated.json`
   - `personal-skill-system/skills/routers/sage/references/skill-catalog.md`
4. 添加来源追踪文档：记录 upstream 仓库地址、commit、license（MIT）、导入日期。
5. 执行验收：

```bash
node personal-skill-system/skills/tools/verify-skill-system/scripts/run.js --target personal-skill-system --json
```

通过条件：`status=pass`。

### Phase B：运行时增强（建议）

目标：把“知识层”升级为“可执行层”。

动作：

1. 新增 `tool`：`verify-chart-spec`
   - 检查 G2 常见违规（v4 链式 API、`chart.options()` 多次覆盖、`transform` 非数组等）。
2. 新增 `tool`：`retrieve-chart-icon`（封装 icon API，限制 `topK` 和超时）。
3. 新增 `tool`：`render-chart-image`（封装 chart API，添加 endpoint allowlist 与失败降级）。

### Phase C：高级闭环（可选）

目标：引入 AntV 的 eval/harness 思路，但不污染主路由面。

动作：

1. 以 `pack` 形式引入评测/优化流程（建议放 `experimental` 或 `project-overlay`）。
2. 仅在需要时启用，不默认绑定主工作流。

## 8. 验收标准（合并门槛）

1. `verify-skill-system` 全绿。
2. 新增路由 fixture 至少覆盖 12 条典型查询（chart/g2/s2/infographic/t8/icon 中英混合）。
3. 随机抽样 20 条图表请求，路由命中 `chart-visualization` 准确率 >= 90%。
4. 网络受限场景下，相关技能必须给出明确降级策略，不得假装成功。

## 9. 发版建议

如果魔尊要“尽快发版”：

1. 先发当前版本（不含 AntV 融合），标签建议 `stable`。
2. 并行做 Phase A，完成后发一个小版本（如 `+1 patch`）。

如果魔尊要“一次到位”：

1. 先完成 Phase A 再发版。
2. Phase B 放到下个迭代，避免当前版本引入外部 API 风险。

## 10. 建议本次讨论拍板项

1. 采用“单域入口（chart-visualization）”还是“多技能平铺入口（6 skills）”。
2. 本期是否纳入联网 tool（icon/chart render）还是先知识型融合。
3. 发版策略选“先发后融”还是“融后再发”。

## 11. 已拍板决策（2026-04-19）

魔尊已确认：

1. 路由形态：`单域入口（chart-visualization）`
2. 本期范围：`仅知识融合`（不引入联网 tools）
3. 发版策略：`先发版后融合`

对应策略收敛：

- 本期只做 domain + references 导入，不新增 runtime/scripted tool。
- 对外路由面仅增加一个 domain，不平铺 6 个 AntV 技能。
- 融合工作在发版后独立分支推进，避免主干污染与高成本回滚。

## 12. 先发版后融合 Runbook（建议执行顺序）

### 12.1 先发版（当前主线）

1. 在当前主线完成你本次发布动作（tag / changelog / 发布产物）。
2. 记录发布基线（例如 tag：`vX.Y.Z`），作为融合工作的回退锚点。

### 12.2 发版后开启融合分支

```bash
git checkout -b feat/chart-knowledge-integration
```

仅允许修改以下范围：

- `personal-skill-system/skills/domains/chart-visualization/**`
- `personal-skill-system/registry/**`
- `personal-skill-system/skills/routers/sage/references/skill-catalog.md`
- `personal_skill_study/**`（评估记录）

### 12.3 融合完成后的验收门

```bash
node personal-skill-system/skills/tools/verify-skill-system/scripts/run.js --target personal-skill-system --json
```

必须满足：

1. `status=pass`
2. `chart-visualization` 路由 fixture 覆盖 >= 12 条
3. 无新增 scripted tool（本期只知识融合）
