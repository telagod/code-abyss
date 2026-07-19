---
name: defending-applications
description: Application security defense knowledge for builders. Covers Web/API/GraphQL hardening (XSS/SQLi/SSRF/IDOR/BOLA/Mass Assignment/deserialization/upload/path traversal), authentication/authorization (OAuth 2.0/OIDC/JWT/Session/Cookie/SAML/SSO), and LLM application security (prompt injection, jailbreak, RAG poisoning, agent privilege escalation, output filtering). Use when designing or reviewing application-layer defenses, fixing CVE-class bugs in your own code, hardening auth flows, or threat-modeling LLM-powered features. For offensive testing see securing-systems/pentest, for incident response see securing-systems/blue-team, for infra-layer hardening see provisioning-infrastructure.
user-invocable: false
---

# 应用安全防御 · 镇魔甲

> **判断先于执行**：决定「是否做 / 选什么 / 如何取舍」（栈、方案、架构、权衡）前，先读领域判断内核 `skills/_kernel/security/SKILL.md`——它管 judgment，本秘典管 execution；冲突时以内核判断为准。

> **开发侧防御秘典**：站在 builder 一侧，把漏洞挡在合并前。
> 不教渗透，只教"如何写出杀不动的代码"和"如何把已生漏洞最小代价闭环"。
> 信级：项目源码/lock 文件 > 框架官方安全文档 > CVE/CWE > 训练记忆（标 `[unverified]`）。

## 路由

| 意图 | 加载 | 触发词 |
|------|------|--------|
| Web/API/GraphQL 漏洞防御 | [web-api-appsec](references/web-api-appsec.md) | XSS, SQLi, SSRF, BOLA, IDOR, Mass Assignment, GraphQL, 反序列化, 文件上传, 路径遍历, XXE, OWASP |
| 认证授权与会话 | [oauth-and-sessions](references/oauth-and-sessions.md) | OAuth, OIDC, JWT, SSO, SAML, Session, Cookie, PKCE, refresh token, kid 注入 |
| LLM 应用安全 | [llm-appsec](references/llm-appsec.md) | Prompt 注入, 越狱, 越权调用, RAG 投毒, agent tool 滥用, 输出过滤, jailbreak |

## 何时使用

| 场景 | 使用本 skill | 使用其他 |
|------|--------------|----------|
| review 自家代码、修 CVE、设计鉴权 | ✅ 本 skill | — |
| 写 SAST 规则、Semgrep 模式 | ✅ 本 skill + securing-systems/code-audit | — |
| 设计 LLM 应用的 guardrail | ✅ llm-appsec | + building-agent-systems/llm-security |
| 红队渗透、写 PoC 攻击目标 | ❌ | securing-systems/pentest |
| 处理已发生的入侵、日志取证 | ❌ | securing-systems/blue-team |
| 容器/K8s/CI 加固 | ❌ | provisioning-infrastructure |
| 设计零信任、身份架构 | 部分（OAuth/SSO 内） | architecting-security |

## 联动

- **securing-systems/code-audit**：本 skill 给"怎么修"，code-audit 给"怎么找"。
- **securing-systems/pentest**：攻方视角验证本 skill 的修复是否真正闭环。
- **analyzing-security**：自动化扫描胶水；本 skill 提供规则语义。
- **building-agent-systems/llm-security**：agent 内部细节；本 skill 关注应用边界。
- **designing-architectures**：威胁建模、API 设计；本 skill 关注落地代码。

## 执行链

```
威胁建模 → 入口梳理 → source→sink 追踪 → 防御层选型 → 最小修复 → 回归测试 → 检测信号埋点
```

每个漏洞的修复必须回答三问：
1. **入口在哪**：用户可控数据从哪进来（route/header/cookie/body/file/upstream API/RAG doc）。
2. **信任边界在哪**：何处由"untrusted"变"trusted"，是否有显式校验。
3. **检测信号是什么**：修复后若被绕过，哪条日志/指标会响。

## 铁律

1. **服务端为真**：前端校验只是 UX，所有 authz/sanitize 必须在服务端再做一次。客户端代码即攻击面。
2. **deny by default**：authz、CORS、CSP、SQL where 子句、文件类型——所有名单皆 allowlist 优先，blacklist 是反模式。
3. **不信任 ID**：URL/body 里的 object_id 永远先做 ownership 校验，再做业务逻辑。BOLA 是 API 漏洞之王。
4. **可观测优先于完美防御**：每个高风险路径必须有结构化日志 + 速率/异常告警，被绕过时能 5 分钟内发现。
5. **修复要带回归**：每个漏洞修复必须配 1 个攻击用例测试 + 1 个正常用例测试，否则六个月后必复发。

## 输出约束

- 漏洞示例代码统一 `❌ 错代码` / `✅ 正代码` 对比，错代码必须能跑通漏洞场景。
- 攻击演示用 `example.com` / RFC 5737 网段（`192.0.2.0/24`）；token/密钥用 `<REDACTED>`。
- 给修复方案时同时给：检测信号（log key / metric name）、回归测试骨架、性能/兼容回归点。
