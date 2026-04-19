# PERSONAL_SKILL_SYSTEM README

## 1. 本轮改动总览（中英双语触发补全）

本轮已将 `PERSONAL_SKILL_SYSTEM` 中所有会影响触发判定的关键面统一为中英双语：

1. `skills/**/SKILL.md`
   - `trigger-keywords`：中英双语
   - `negative-keywords`：中英双语（非空项）
   - `aliases`：中英双语
2. `templates/skill/**/SKILL.md`
   - 同步中英双语模板字段，避免新建 skill 回退到单语
3. `registry/route-map.generated.json`
   - `activation.trigger-keywords`：中英双语
   - `activation.negative-keywords`：中英双语（非空项）
   - `aliases`：新增并中英双语
4. `registry/route.schema.json`
   - 路由 schema 新增 `aliases` 字段定义
5. `skills/tools/lib/skill-system-routing.js`
   - 启用 `alias-match` 打分（此前存在评分项但未实际参与）
   - 匹配改为边界匹配，避免 `sec` 误命中 `security`、`verify-security` 被抢占
6. `registry/route-fixtures.generated.json`
   - 新增中文与 alias 触发回归用例

---

## 2. 验证结果

已完成以下验证并通过：

1. 双语覆盖统计
   - `SKILL.md`：`trigger` 35/35 双语
   - `SKILL.md`：`negative`（非空）24/24 双语
   - `SKILL.md`：`aliases`（非空）35/35 双语
   - `route-map`：29/29 route 含双语 `trigger` 与双语 `aliases`
2. 路由回归
   - `route-fixtures`：17/17 通过
3. 结构校验
   - `verify-skill-system`：`status=pass`

建议复验命令：

```bash
node personal-skill-system/skills/tools/verify-skill-system/scripts/run.js --target personal-skill-system --json
```

---

## 3. 部署到 `.claude/skills` 的正确方式

结论：**不要把外层 `personal-skill-system` 整包再套一层放进去**。

推荐目录形态（Claude/OpenCode 兼容）：

```text
~/.claude/skills/
  routers/
    sage/
      SKILL.md
      references/...
  domains/
    architecture/
      SKILL.md
      references/...
  workflows/
  tools/
  guards/
```

不要使用这种额外嵌套形态：

```text
~/.claude/skills/personal-skill-system/skills/...
```

原因：

1. 该 bundle 文档明确建议 folder-capable host 复制“完整 skill 目录”，而不是只贴单文件。
2. 触发与能力深度依赖 `references/` 与 `scripts/` 协同。

---

## 4. 跨 CLI 兼容性（你关心的 OpenCode 等）

结论（当前口径）：

1. **Claude Code**：可读 `~/.claude/skills/**/SKILL.md`，兼容本体系。
2. **OpenCode**：可读 Claude-compatible skills 目录结构时可复用（以其当前官方文档为准）。
3. **其他 CLI**：若支持 Claude-style skills discovery（`<skill>/SKILL.md`）通常可复用；若仅支持 prompt-only 或私有 schema，则需要适配层。

注意事项：

1. 兼容核心是目录结构与文件契约，不是“文件名看起来像”。
2. 工具类 skill（`runtime: scripted`）需保留 `scripts/` 才能完整发挥。
3. 若某 CLI 不支持脚本执行，可退化为 knowledge-only 使用。

---

## 5. 维护建议（后续继续演进）

1. 每次改动 `SKILL.md` 后同步更新 `route-map.generated.json`。
2. 新增或调整关键词后，补一条 fixture 回归样例（中/英至少各一条）。
3. 发布前固定执行：

```bash
node personal-skill-system/skills/tools/verify-skill-system/scripts/run.js --target personal-skill-system --json
```

4. 保持“入口薄、参考深”：
   - `SKILL.md` 保持触发与职责清晰
   - 深度策略放在 `references/`

