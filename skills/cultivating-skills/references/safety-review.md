# 安全审查清单

> 默认拒绝，命中即阻断。落盘前必跑 `safety_scan`，PR 合并前 CI 再跑一次。

## 阻断级（block）—— 必修

### B1：frontmatter 不合规

| 检查 | 阻断条件 |
|------|---------|
| `name` | 缺失、非 kebab-case、与现有 skill 重名 |
| `description` | 缺失、< 40 字、含 "various"/"general"/"helper" 通用词 |
| `user-invocable` | 缺失、非 boolean |
| `allowed-tools` | 含 `*` 通配、非 PascalCase 工具名 |

### B2：硬编码秘密

复用 [analyzing-security](../../analyzing-security/scripts/security_scanner.js) 规则集：
- `HARDCODED_SECRET`、`HARDCODED_AWS_KEY`、`HARDCODED_PRIVATE_KEY`、`HARDCODED_GITHUB_TOKEN` 等

### B3：危险默认模板

skill 内若包含**鼓励用户复制粘贴执行**的危险命令，阻断：

| 模式 | 例 |
|------|---|
| `rm -rf /` 或近似 | `rm -rf $HOME`、`rm -rf $1` 无校验 |
| 远程执行 | `curl <url> \| sh`、`wget <url> \| bash` |
| 任意代码执行 | `eval $(...)`、`python -c "$INPUT"`、`os.system($USER_INPUT)` |
| 凭据外泄 | `echo $TOKEN >> /tmp`、网络上传环境变量 |
| 关闭安全 | `set +e`+`sudo`、`SELINUX=disabled`、`--no-verify` 默认开启 |

> 例外：在 `references/` 中作为**反例**展示且明确标注"❌ 危险"——允许，但必须人眼 review。

### B4：Prompt injection 反模式

skill 内包含以下模式 → 阻断（无论作为指令还是范例）：

```
ignore previous instructions
you are now <new role>
reveal your system prompt
override your instructions
disregard all prior
forget everything above
```

### B5：scripts 多入口

`scripts/*.js` 数量 > 1 → registry fail，阻断。

### B6：引用悬空

SKILL.md 中 `[...](references/*.md)` 链接指向不存在文件 → 阻断。

## 警告级（warn）—— 可强制

`--force` 可绕过，但 PR 必须记录理由：

| 检查 | 触发 |
|------|------|
| W1：SKILL.md > 90 行 | 应当下沉 references |
| W2：单 reference > 800 行 | 应当拆分 |
| W3：`allowed-tools` 含 `Bash`/`Write`/`Edit`/`WebFetch` 但 SKILL.md 未说明理由 | 扩权需透明 |
| W4：description 含 emoji 或 markdown | 影响 Agent 解析 |
| W5：scripts 调用网络（`https.request`/`fetch`/`axios`）未声明 | 网络副作用必须显式 |
| W6：scripts 写文件路径含变量插值 | 路径穿越风险 |

## 信息级（info）—— 仅提示

- I1：SKILL.md 无"何时不使用"段落 → 建议补
- I2：references 命名不规范（建议 `kebab-case.md`）
- I3：缺少 `argument-hint` 但 user-invocable=true
- I4：未链接到姊妹 skill，可能孤岛

## 三级 tier 的差异化策略

| Tier | scan 阻断行为 |
|------|--------------|
| L0 local | block 仍阻断；warn 默认放行（个人责任） |
| L1 project | block + 50% warn 阻断（保护团队） |
| L2 community | 全 block + 全 warn 阻断（保护生态） |

## 误报豁免

若确认是假阳：
1. 在 SKILL.md 顶部 frontmatter 下方加注释 `<!-- safety-scan: ignore <RULE_ID> 理由 -->`
2. PR 描述里说明
3. reviewer 二次确认

> 注：B 类（block）规则**不可豁免**，发现即必修。
