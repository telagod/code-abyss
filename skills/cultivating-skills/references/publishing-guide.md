# 三级发布漏斗

> 从私域到公域，每升一级，门槛递增。默认从 L0 起步。

## L0 → 本地私有

**位置：** `~/.claude/skills/local/<name>/`（用户自建命名空间）

**门槛：**
- `safety_scan` block 通过
- 自我可读

**特性：**
- 不入主路由表（`origin: local` 标记）
- 仅显式调用（用户敲命令、Agent 不会自主路由）
- 不进入 git
- 安装/卸载 Code Abyss 时**不动**

**适用：**
- 个人快速实验
- 私密内容（涉及内部约定、未公开方法论）
- 想用但没把握质量

## L1 → 项目私有

**位置：** `<repo>/.claude/skills/<name>/`（仓库内 git tracked）

**门槛：**
- L0 全部
- `safety_scan` warn 阻断（除非 `--force` + PR 记录）
- `npm run verify:skills` 通过
- 至少一个团队成员 review

**特性：**
- 跟随仓库 git
- 团队共享
- 进入项目级路由（仅本仓库 Agent 可见）
- CI 应增加 lint hook

**适用：**
- 团队工程方法论
- 项目特定流程（如某种 release 工作流）
- 试用一段时间后再考虑 L2

## L2 → 社区贡献

**位置：** `code-abyss/skills/<name>/`（upstream main 分支）

**门槛：**
- L1 全部
- `safety_scan` 全级别阻断
- 通过 CI 全部测试（包括 install / uninstall smoke）
- description 必须 ≥ 40 字、≤ 200 字
- SKILL.md ≤ 90 行
- 有具体使用场景说明
- 与现有 22 skill 边界清晰
- 维护者 review

**渠道：**

### 推荐路径：复用 submit portal

1. 访问 [submission portal](https://telagod.github.io/code-abyss/submit.html)
2. 选择"Skill"类型（如尚未支持，开 Issue 请求）
3. 填表 → 自动生成 Issue + 附件
4. 维护者 triage → 提 PR 草案 → 反复迭代

### 备用路径：直接 PR

1. Fork → 新建分支 `skill/<name>`
2. 在 `skills/<name>/` 落盘
3. 跑全部本地校验
4. PR 描述模板：
   ```
   ## 新 skill: <name>

   ### 解决什么问题
   <一段>

   ### 为何独立成 skill（边界）
   <对比已有 22 skill，说明差异>

   ### 何时使用
   <复制 SKILL.md 矩阵>

   ### 安全说明
   - allowed-tools: <列表>，理由：<为何需要>
   - safety_scan 输出：<贴日志>

   ### 测试
   - [ ] npm run verify:skills
   - [ ] node scripts/skill_forge.js scan
   - [ ] 手动安装到 ~/.claude/ 验证
   ```

## 升级命令

```bash
# L0 → L1
node scripts/skill_forge.js promote ~/.claude/skills/local/<name> --to project --repo <path>

# L1 → L2 (生成 PR 草案)
node scripts/skill_forge.js promote <repo>/.claude/skills/<name> --to community
```

## 降级（罕见）

社区版本撤回：通过 PR 删除 + CHANGELOG 标 deprecated，至少保留一个 minor 版本周期。

## 命名规范（L2 必守）

- gerund 形式（`-ing` 结尾）：`cultivating-`、`analyzing-`、`generating-`、`detecting-`
- 与现有 22 skill 的 prefix 无冲突
- 单数 / 复数与现有约定一致（`processing-pdfs` 而非 `processing-pdf`）
- 长度 ≤ 32 字符

## 反模式

- ❌ L0 直接跳 L2 → 必经 L1，让团队 review
- ❌ 未跑 `safety_scan` 即提 PR → CI 必拒
- ❌ 复制现有 skill 大段内容→用 reference 链接
- ❌ description 含营销腔（"powerful"、"comprehensive"、"all-in-one"）→ 必改
