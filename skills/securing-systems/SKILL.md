---
name: securing-systems
description: Security engineering router for authorized assessments and defensive engineering. Covers penetration testing, code auditing, red/blue/purple team operations, threat intelligence, and vulnerability research. For specialized application security, cloud security, detection engineering, or security architecture, route to dedicated skills (defending-applications, securing-cloud-and-supply-chain, detecting-and-responding, architecting-security).
user-invocable: false
---

# 攻防秘典

> **判断先于执行**：决定「是否做 / 选什么 / 如何取舍」（栈、方案、架构、权衡）前，先读领域判断内核 `skills/_kernel/security/SKILL.md`——它管 judgment，本秘典管 execution；冲突时以内核判断为准。

> **安全工程总路由**：通用攻防视角与红队 / 蓝队 / 紫队基础知识。
> 专域工作（应用安全防御、云原生加固、检测工程、安全架构）走专门 skill。
> 信级：项目文件 > 标准库 > 训练记忆（标 `[unverified]`）

## 路由

### 攻防基础（本 skill 内）

| 意图 | 秘典 | 核心 |
|------|------|------|
| 渗透测试 | [pentest](references/pentest.md) | Web/API/内网、OWASP、BOLA、JWT、GraphQL |
| 代码审计 | [code-audit](references/code-audit.md) | 危险函数、污点追踪、Source→Sink |
| 红队攻击 | [red-team](references/red-team.md) | PoC、C2、横移、免杀、供应链 |
| 蓝队防御 | [blue-team](references/blue-team.md) | 检测、SOC、IR、取证、密钥轮换 |
| 威胁情报 | [threat-intel](references/threat-intel.md) | OSINT、威胁狩猎、ATT&CK 建模 |
| 漏洞研究 | [vuln-research](references/vuln-research.md) | 逆向、Exploit、Fuzzing、PWN |
| 授权分级 / CTF 沙箱契约 | [authorization-tiers](references/authorization-tiers.md) | T1/T2/T3、CTF 目标默认沙箱 |

### 专域路由（其他 skill）

| 意图 | 走 skill | 适用 |
|------|---------|------|
| 应用层防御（XSS / SQLi / OAuth / LLM AppSec） | [defending-applications](../defending-applications/SKILL.md) | 写代码 / 修 CVE / 鉴权设计 |
| 云原生 + 供应链加固 | [securing-cloud-and-supply-chain](../securing-cloud-and-supply-chain/SKILL.md) | K8s / CI/CD / SLSA / 云 IAM |
| 检测工程 + 蓝紫队 | [detecting-and-responding](../detecting-and-responding/SKILL.md) | Sigma / EDR / IR / 威胁狩猎 |
| 安全架构 + 合规 + 身份 | [architecting-security](../architecting-security/SKILL.md) | 威胁建模 / 零信任 / SOC2/PCI |

## 执行链

```
攻：侦察 → 武器化 → 投递 → 利用 → 安装 → C2 → 行动
守：预防 → 检测 → 响应 → 恢复
紫队：ATT&CK → 红攻 → 蓝检 → 缺口 → 闭环
```

## 输出约束

- 安全测试代码输出须标注使用场景（Security Testing / Defense Validation / Security Research）
- 涉及真实 IP / 域名时使用 RFC 5737 保留地址（`192.0.2.0/24`、`198.51.100.0/24`）或 `example.com`
- 凭证、密钥、Token 一律使用占位符（`<REDACTED>`、`<TARGET-TOKEN>`）
- 不生成针对特定未授权目标的定制攻击代码
- 优先输出防御视角：每个攻击技术附带检测 / 缓解建议
- 涉及云端写入、生产环境、凭据、远程 push/PR、CI/CD 权限或基础设施变更前，必须先确认范围和授权

## 优先级

| 场景 | 排序 |
|------|------|
| 攻击模拟 | 效果 > 精准 > 控制 |
| 防御响应 | 正确 > 覆盖 > 速度 |
| 紧急事件 | 速度 > 正确 > 简洁 |
