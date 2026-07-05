---
name: architecting-security
description: 安全架构与治理：威胁建模 (STRIDE/PASTA/LINDDUN)、零信任身份架构、IAM/SSO/MFA/PAM、合规框架 (SOC2/PCI/HIPAA/GDPR)、DLP、隐私工程、安全控制设计。Use when designing security architecture, threat modeling new systems, implementing zero-trust identity, designing IAM/SSO/PAM, building compliance evidence chains, or planning privacy-by-design.
user-invocable: false
---

# 安全架构与治理

> **判断先于执行**：决定「是否做 / 选什么 / 如何取舍」（栈、方案、架构、权衡）前，先读领域判断内核 `skills/_kernel/security/SKILL.md`——它管 judgment，本秘典管 execution；冲突时以内核判断为准。

> 架构是预防层，不是补丁。先建模再写代码，先定边界再开 API。控制必须可证据化。

## 路由

| 意图 | 秘典 | 核心 |
|------|------|------|
| 威胁建模 | [threat-modeling](references/threat-modeling.md) | STRIDE / PASTA / LINDDUN / DFD / Attack Tree |
| 身份与零信任 | [identity-and-zero-trust](references/identity-and-zero-trust.md) | IAM / SSO / MFA / Kerberos / PAM / Conditional Access |
| 合规与证据 | [compliance-and-evidence](references/compliance-and-evidence.md) | SOC2 / PCI / HIPAA / GDPR / ISO27001 / DLP / 隐私工程 |

## 何时使用

| 场景 | 用 | 不用 |
|------|----|----|
| 新系统设计 / 新攻击面引入 | ✅ STRIDE + DFD | — |
| 重大架构变更（鉴权、数据流、信任边界）| ✅ 重新建模 | — |
| 引入 PII / PHI / PCI 数据 | ✅ LINDDUN + 合规映射 | — |
| 上线前安全门禁 / 客户安全问卷 | ✅ 控制矩阵 + 证据 | — |
| 已有架构无变更 | ❌ | 用现有控制即可 |
| 仅 bug 修复 / 样式调整 | ❌ | 走 [analyzing-security](../analyzing-security/SKILL.md) |
| 渗透实施层面 | ❌ | 用 [securing-systems](../securing-systems/SKILL.md) |

## 执行链

```
威胁建模 (STRIDE/PASTA/LINDDUN)
  → 控制设计 (preventive / detective / responsive 三层)
  → 实现 (代码、IaC、policy-as-code)
  → 验证 (渗透 / 红队 / 控制测试)
  → 证据留痕 (日志 / 审计 / 合规映射)
```

每环必须可回答「这控制对应哪条威胁？这威胁缓解到什么残留水平？谁验收？」

## 决策矩阵

| 决策点 | 选项 A | 选项 B | 判据 |
|--------|--------|--------|------|
| 鉴权协议 | SAML 2.0 | OIDC | 企业内部 SSO → SAML；移动/SPA/API → OIDC |
| MFA 强度 | TOTP / Push | FIDO2 / WebAuthn | 高价值账号、抗钓鱼 → FIDO2 强制 |
| 特权访问 | Standing privilege | JIT + Approval | 生产/敏感 → JIT；运维便利 → Standing 必有补偿 |
| 合规起步 | SOC 2 Type I | Type II | 客户问卷应付 → I；正式审计 → II（6-12月观察期）|
| 数据脱敏 | 假名化（可逆）| 匿名化（不可逆）| 业务侧仍需关联 → 假名化 + KMS；统计/共享 → 匿名化 |
| 跨境传输 | SCC | BCR | 偶发场景 → SCC；跨国集团内部 → BCR |

## 与其他 skill 联动

- 威胁建模产出 → [analyzing-security](../analyzing-security/SKILL.md) 把高危项纳入扫描规则
- 代码层防御 → [securing-systems](../securing-systems/SKILL.md)（pentest / code-audit / red-team）
- IaC 策略落地 → [provisioning-infrastructure](../provisioning-infrastructure/SKILL.md)（OPA / Sentinel / Conftest）
- LLM/Agent 系统威胁 → [building-agent-systems](../building-agent-systems/SKILL.md)（Prompt Injection / 模型窃取）
- API 接口面 → [designing-architectures](../designing-architectures/SKILL.md) 的 `api-design.md`
- 审计证据自动化 → [automating-devops](../automating-devops/SKILL.md)（CI 持续合规）

## 铁律

1. **先建模再写代码** — 威胁清单未出，代码不动；信任边界未画，接口不开。
2. **控制必须证据化** — 任何控制都要回答「日志在哪？审计点在哪？谁是 owner？SLA 多久？」
3. **零信任默认拒绝** — 永不信任、始终验证、最小权限到请求级；缺一即非零信任。
4. **合规不是法律意见** — 框架映射可以做，最终结论须法务/合规官签字。
5. **残留风险必须留痕** — 不能消的风险要在 DESIGN.md / 风险登记册显式接受 + 补偿控制。
