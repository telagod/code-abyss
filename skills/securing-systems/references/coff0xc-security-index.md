---
name: coff0xc-security-index
description: Coff0xc 安全能力索引。路由应用安全、云/DevSecOps、检测响应、漏洞生命周期、身份零信任、授权评估、逆向移动IoT、区块链、合规架构、紫队欺骗、网络协议安全。
---

# Coff0xc 安全能力索引

本索引把 Coff0xc 安全相关 skills 合入 Code Abyss 的 `security` domain。所有内容默认用于授权评估、防御建设、检测、加固、验证和报告，不用于未授权访问、凭据窃取、持久化、规避检测、C2、钓鱼收集、数据外传或破坏性动作。

来源说明：本组扩展文档改写自 Coff0xc 的 `coffee-skill` 安全能力集合，用 Code Abyss 的 domain-reference 结构重新组织。原 `coffee-skill` 仓库使用 Apache License 2.0；本仓库已附带 [`NOTICE.coff0xc-security.md`](../../../NOTICE.coff0xc-security.md) 与 [`THIRD_PARTY_LICENSES/Apache-2.0-coffee-skill.txt`](../../../THIRD_PARTY_LICENSES/Apache-2.0-coffee-skill.txt) 完成归属与许可证全文分发。

## 路由表

| 用户意图 | 文档 | 适用范围 |
| --- | --- | --- |
| 代码审计、Web/API/GraphQL/OAuth/浏览器/LLM AppSec | [coff0xc-secure-code-appsec](coff0xc-secure-code-appsec.md) | 入口梳理、Source/Sink、认证授权、业务逻辑、后门检测 |
| 云安全、容器、K8s、CI/CD、供应链、密钥 | [coff0xc-cloud-devsecops](coff0xc-cloud-devsecops.md) | IAM、镜像、RBAC、workflow 权限、SBOM、secret handling |
| SIEM、Sigma、YARA、告警、威胁狩猎、IR、取证 | [coff0xc-detection-response](coff0xc-detection-response.md) | 检测工程、SOC、情报、邮件安全、样本分诊、应急闭环 |
| CVE、补丁对比、漏洞管理、优先级、修复跟踪 | [coff0xc-vulnerability-lifecycle](coff0xc-vulnerability-lifecycle.md) | 影响评估、CVSS/EPSS/KEV、授权验证、报告和修复 |
| IAM、SSO、MFA、AD/Kerberos、权限、零信任 | [coff0xc-identity-zero-trust](coff0xc-identity-zero-trust.md) | 身份治理、凭证风险、PAM、横向移动防御 |
| 授权评估、ROE、红队计划、防护发现、控制验证 | [coff0xc-authorized-assessment](coff0xc-authorized-assessment.md) | 规则边界、攻击面、防御化演练、报告 |
| 逆向、二进制、移动、固件、IoT、ICS、CTF、密码学 | [coff0xc-binary-mobile-iot](coff0xc-binary-mobile-iot.md) | 静态/动态分析、接口枚举、协议与硬件边界 |
| Solidity、DeFi、Web3、跨链、多链智能合约审计 | [coff0xc-blockchain-security](coff0xc-blockchain-security.md) | 资金流、权限、预言机、桥、token/NFT、多链扫描 |
| 威胁建模、合规、DLP、隐私、控制矩阵、安全架构 | [coff0xc-compliance-architecture](coff0xc-compliance-architecture.md) | STRIDE、NIST/CIS/ISO/SOC2/PCI/GDPR 映射 |
| 紫队、ATT&CK、检测覆盖、蜜罐、欺骗防御 | [coff0xc-purple-deception](coff0xc-purple-deception.md) | 控制验证、覆盖指标、演练闭环 |
| TLS/DNS/QUIC/HTTP、pcap、无线、BLE、RF、形式化协议 | [coff0xc-network-protocol-security](coff0xc-network-protocol-security.md) | 协议设计、抓包、异常字段、ProVerif/Mermaid |

## 通用执行原则

- 先明确授权范围、资产、数据敏感度、禁止动作和完成标准。
- 先看代码、配置、日志、样本或用户提供证据，再下结论。
- 区分证据等级：已验证、高可信、推断、未验证、未知。
- 高风险请求默认转成防御输出：边界、风险解释、检测、加固、验证和报告。
- 真实命令、扫描、测试和构建只有运行过才能写成“已验证”。
- 发现密钥或个人信息时只报告类型、位置和处置建议，不复述完整秘密值。

## 输出合同

```markdown
完成：
- ...

证据：
- [已验证/高可信/推断/未验证/未知] ...

行动：
- ...

验证：
- ...

剩余风险：
- ...

下一步：
- ...
```
