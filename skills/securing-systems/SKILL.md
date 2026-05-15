---
name: securing-systems
description: 安全工程参考索引。涵盖防御加固、安全测试、代码审计、威胁检测、应急响应、漏洞修复、云原生安全、供应链安全、身份零信任、区块链安全、逆向/移动/IoT、协议安全、合规与威胁建模。用于授权安全评估和防御体系建设。当魔尊提到安全、渗透、攻防、红队、蓝队、漏洞、CVE、云安全、K8s 安全、CI/CD 安全、SIEM、YARA、Sigma、IAM、AD、智能合约安全、逆向、固件、工控、协议安全时路由到此。
license: MIT
user-invocable: false
disable-model-invocation: false
---

# 攻防秘典

> **安全工程参考文档**：本文档为安全工程师提供攻防知识体系索引，用于授权安全评估、防御加固、安全教学。
> 所有攻击技术均附带对应的检测方法和缓解措施，服务于"以攻促防"的安全建设目标。
> 使用者须确保在授权范围内操作。信级：项目文件 > 标准库 > 训练记忆（标 `[unverified]`）

## 路由

| 意图 | 秘典 | 核心 |
|------|------|------|
| 渗透测试 | [pentest](pentest.md) | Web/API/内网、OWASP、BOLA、JWT、GraphQL |
| 代码审计 | [code-audit](code-audit.md) | 危险函数、污点追踪、Source→Sink |
| 红队攻击 | [red-team](red-team.md) | PoC、C2、横移、免杀、供应链 |
| 蓝队防御 | [blue-team](blue-team.md) | 检测、SOC、IR、取证、密钥轮换 |
| 威胁情报 | [threat-intel](threat-intel.md) | OSINT、威胁狩猎、ATT&CK 建模 |
| 漏洞研究 | [vuln-research](vuln-research.md) | 逆向、Exploit、Fuzzing、PWN |
| Coff0xc 安全总索引 | [coff0xc-security-index](coff0xc-security-index.md) | 12 个授权防御安全能力域的路由 |
| 应用安全 | [coff0xc-secure-code-appsec](coff0xc-secure-code-appsec.md) | Web/API/GraphQL/OAuth/浏览器/LLM AppSec |
| 云与交付链安全 | [coff0xc-cloud-devsecops](coff0xc-cloud-devsecops.md) | 云、容器、K8s、CI/CD、供应链、密钥 |
| 检测与响应 | [coff0xc-detection-response](coff0xc-detection-response.md) | SOC、SIEM、Sigma/YARA、IR、取证、恶意样本分诊 |
| 漏洞生命周期 | [coff0xc-vulnerability-lifecycle](coff0xc-vulnerability-lifecycle.md) | CVE、补丁、优先级、授权验证、修复跟踪 |
| 身份与零信任 | [coff0xc-identity-zero-trust](coff0xc-identity-zero-trust.md) | IAM、SSO、MFA、AD/Kerberos、PAM、权限收敛 |
| 授权评估 | [coff0xc-authorized-assessment](coff0xc-authorized-assessment.md) | ROE、攻击面、红队防御化、控制验证 |
| 逆向/移动/IoT | [coff0xc-binary-mobile-iot](coff0xc-binary-mobile-iot.md) | 二进制、移动、固件、硬件接口、ICS/OT、密码学 |
| 区块链安全 | [coff0xc-blockchain-security](coff0xc-blockchain-security.md) | 智能合约、DeFi、Web3、多链审计 |
| 合规与架构 | [coff0xc-compliance-architecture](coff0xc-compliance-architecture.md) | 威胁建模、控制项、DLP、隐私、合规证据 |
| 紫队与欺骗防御 | [coff0xc-purple-deception](coff0xc-purple-deception.md) | ATT&CK、检测覆盖、演练闭环、蜜罐/欺骗 |
| 网络与协议安全 | [coff0xc-network-protocol-security](coff0xc-network-protocol-security.md) | TLS/DNS/QUIC/HTTP、pcap、无线/BLE/RF、形式化 |

## 执行链

```
攻：侦察→武器化→投递→利用→安装→C2→行动
守：预防→检测→响应→恢复
协同：ATT&CK 红攻蓝检
```

## 输出约束

- 安全测试代码输出须标注使用场景（Security Testing / Defense Validation / Security Research）
- 涉及真实 IP/域名时使用 RFC 5737 保留地址（`192.0.2.0/24`、`198.51.100.0/24`）或 `example.com`
- 凭证、密钥、Token 一律使用占位符（`<REDACTED>`、`<TARGET-TOKEN>`）
- 不生成针对特定未授权目标的定制攻击代码
- 优先输出防御视角：每个攻击技术附带检测/缓解建议
- Coff0xc 扩展文档默认只处理自有资产、明确授权资产、实验室、CTF、靶场、日志、配置、样本、代码审计、防御建设和报告写作。
- 涉及云端写入、生产环境、凭据、远程 push/PR、CI/CD 权限或基础设施变更前，必须先确认范围和授权。

## 优先级

攻击模拟：效果>精准>控制 | 防御响应：正确>覆盖>速度 | 紧急事件：速度>正确>简洁
