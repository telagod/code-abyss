---
name: analyzing-security
description: Scans code for security vulnerabilities, detects dangerous patterns, and ensures security decisions are documented. Use when running security scans, auditing code, or checking for OWASP issues, injection risks, or sensitive data leaks. Automatically triggered on new modules, security-related changes, or post-refactor.
compatibility: node>=18
user-invocable: false
allowed-tools: Bash, Read, Grep
argument-hint: <扫描路径>
---

# 安全校验关卡

> **判断先于执行**：决定「是否做 / 选什么 / 如何取舍」（栈、方案、架构、权衡）前，先读领域判断内核 `skills/_kernel/security/SKILL.md`——它管 judgment，本秘典管 execution；冲突时以内核判断为准。

> 自动化扫描捕捉模式，但**严重度判定与处置取决于上下文**——sink、信任边界、补偿控制。

## 何时使用

| 场景 | 必跑 | 理由 |
|------|------|------|
| 新模块落地 | ✅ | 引入新攻击面 |
| 安全相关变更 | ✅ | 直接触及威胁面 |
| 重构完成 | ✅ | 防止重构引入退化 |
| 提交前（含敏感数据/外部输入处理） | ✅ | 最后一道闸 |
| 攻防任务交付 | ✅ | 验收前自检 |
| 仅文档/样式改动 | ❌ | 无攻击面变化 |

## 何时不使用

- 依赖更新（用 SCA 工具如 `npm audit`、`pip-audit`，不是模式扫描）
- 运行时漏洞（用 DAST，不是静态扫描）
- 配置审计（用 CIS Benchmark 或专用工具）

## 解读输出

严重度（critical / high / medium / low）+ 类别（注入 / 敏感信息 / XSS / 反序列化 / 路径遍历 / SSRF / 弱加密 / 不安全随机 / 调试残留）。

### 必修

- **Critical**（SQL 注入、命令注入、硬编码密钥、AWS Key、私钥）→ 阻断交付，无例外。
- **High**（XSS、反序列化、路径遍历、SSRF）→ 修复或显式接受风险（需 DESIGN.md 留痕 + 补偿控制）。

### 上下文降级条件

- **Medium/Low** 可在 DESIGN.md 标注「已知/已评估」后保留。判据：
  - 弱加密 MD5/SHA1 用于非安全场景（如 hash bucket）→ 可接受
  - `random` 用于非安全场景（如 jitter）→ 可接受
  - 调试残留在 dev-only 构建 → 可接受，prod 构建必须剔除

### 假阳处理

每条规则均有 `excludePattern`，若仍误报：
1. 检查命中文本是否真为 sink（看上下文，不只是模式）
2. 若确认假阳，在 DESIGN.md 记录 + 行内注释（`// nosec: <规则 ID> <理由>`）

## 与其他 skill 联动

- 命中 critical/high → 同步触发 [securing-systems](../securing-systems/SKILL.md) 路由的对应秘典（如 SQL 注入查 `pentest.md`）
- 新模块场景 → 与 [verifying-modules](../verifying-modules/SKILL.md) 串行，先扫安全再校验文档
- 变更场景 → 与 [analyzing-changes](../analyzing-changes/SKILL.md) 串行，先看变更范围再决定扫描深度

## 使用

```bash
node scripts/security_scanner.js <路径>            # 默认全扫
node scripts/security_scanner.js <路径> -v         # 详细，含命中代码片段
node scripts/security_scanner.js <路径> --json     # 机读格式，供 CI
node scripts/security_scanner.js <路径> --exclude vendor,dist
```

完整规则矩阵、危险模式速查、误报豁免清单详见 [references/rules.md](references/rules.md)。

## 收口

Critical/High 必修后方可交付。安全决策须于 DESIGN.md 记录：威胁模型、信任边界、已知风险、补偿控制。
