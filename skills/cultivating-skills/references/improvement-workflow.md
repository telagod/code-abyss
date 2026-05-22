# 现有 skill 改进流程

> 不重造，只补漏。改进必须可解释为 diff，不可整体覆写。

## 触发判定

| 信号 | 处置 |
|------|------|
| 现有 skill 缺关键场景（如 oauth-and-sessions 缺 PKCE） | 在对应 reference 增量追加章节 |
| 表述模糊导致 Agent 多次问同一类问题 | 改 SKILL.md 的"何时使用"矩阵 |
| 规则集过时（如新 OWASP API Top 10） | 替换 `references/rules.md` 对应条目 |
| scripts 漏报 / 误报 | 在 scripts 内调整规则，附测试 |
| 多个 skill 内容重复 | 抽公共 reference，互相链接 |

## 改进等级

### L1：微调（无破坏）

- 修 typo、补例子、调表头
- 直接 PR，不需提案

### L2：增补（半破坏）

- 加新章节、加新 reference 文件
- description / argument-hint 微调
- PR 描述说明：新增什么、为何

### L3：重写（破坏性）

- 改 frontmatter 关键字段（name / user-invocable / allowed-tools）
- 拆/合 skill
- **必须先开 Issue 讨论**，方案确认后再动手

## 流程

### 1. 病灶定位

```bash
# 看现有内容
cat skills/<target>/SKILL.md
ls skills/<target>/references/

# 看历史决策
git log --oneline skills/<target>/

# 看测试覆盖
grep -r "<target>" test/
```

### 2. 最小修改原则

- 改 SKILL.md → 优先动"何时使用"矩阵 / "联动"段落，主体结构不动
- 改 reference → 在合适章节内增改，不打乱顺序
- 改 scripts → 加规则不删旧规则（除非确认误报），保留 `--legacy` 通路一个版本

### 3. 验证链

```bash
node scripts/skill_forge.js scan skills/<target>
node scripts/skill_forge.js lint skills/<target>
npm run verify:skills
npm test                              # 触及 registry / install 必跑
```

### 4. 文档同步

| 改动 | 同步项 |
|------|--------|
| 新增 user-invocable skill | 检查 `commands/*.md` 生成是否符合预期 |
| 改 description | 看主 README skill matrix 是否需要更新 |
| 改 allowed-tools | 安装到 Claude / Codex / Gemini 后人肉验证一次 |

## 反模式

- ❌ 整体覆写他人 skill → 改成 diff 思路，保留可追溯性
- ❌ 删除 reference 文件 → 至少保留一个版本周期，新文件用 `*-v2.md` 命名
- ❌ 在 SKILL.md 直接塞新内容超 90 行 → 沉到 references
- ❌ 改 scripts 不补测试 → 必须给一个最小复现样例
