---
name: coff0xc-secure-code-appsec
description: 应用安全与代码审计。覆盖 Web/API/GraphQL/OAuth/浏览器/SPA/LLM AppSec、Source/Sink、认证授权、后门检测和授权验证。
---

# Coff0xc · 应用安全与代码审计

## 触发

代码审计、安全审计、危险函数、source/sink、污点分析、Web 安全、API 安全、GraphQL、OAuth、CSP、CORS、Cookie、Prompt 注入、越权、SSRF、XSS、SQLi、后门、Webshell、绕过登录、看到别人数据、代码入口、数据流。

## 边界

- 只处理自有资产、明确授权资产、实验室、CTF、靶场、日志、配置、样本、代码审计和防御报告。
- 不对未授权目标提供主动扫描、爆破、利用链、绕过脚本或数据外传步骤。
- 高风险请求转为防御输出：授权边界、检测、加固、验证、报告。

## 能力矩阵

| 能力域 | 覆盖 | 证据 |
| --- | --- | --- |
| 入口梳理 | routes、controllers、GraphQL resolvers、webhooks、file upload、SPA routes | 用户可控输入清单 |
| Source/Sink | 请求参数、headers、cookies、body、files、env、DB 到 command、SQL、template、file、URL、deserialize | 可达数据流 |
| 认证授权 | session、JWT、OAuth/OIDC、tenant、role、object ownership、CSRF | 权限路径 |
| Web/API 漏洞 | 注入、XSS、SSRF、XXE、path traversal、deserialization、IDOR、logic bug | 文件/行号/请求条件 |
| 浏览器/SPA | CSP、CORS、postMessage、Cookie、storage、DOM sink、extension manifest | 前端信任边界 |
| GraphQL | schema、resolver auth、batching、depth、introspection、IDOR、N+1 | 字段级权限 |
| LLM/Agent 安全 | prompt injection、tool injection、data leakage、memory poisoning、agent CI/CD | 工具权限和数据边界 |
| 后门检测 | 异常入口、混淆、动态执行、可疑网络、隐藏账号、计划任务 | 代码/配置证据 |

## 工作流

1. 范围确认：资产、代码、环境、测试方式、禁止动作、输出敏感度。
2. 架构/入口：读取路由、schema、auth middleware、controllers、clients、config、tests。
3. 数据流分析：从 source 到 sink 追踪校验、转义、权限和异常处理。
4. 验证优先级：按可达性、影响、权限、复杂度和数据敏感度排序。
5. 修复设计：给最小修复、测试用例、兼容影响、日志/监控建议。
6. 报告复查：每个发现包含位置、影响、证据、复现条件、修复、验证。

## 验证清单

- 静态：文件/行号、调用链、source/sink、权限路径。
- 动态：仅在授权本地/测试环境中验证，记录请求条件和预期结果。
- 工具：Semgrep/CodeQL/SARIF 结果需去重和误报分析。
- 修复：加入回归测试，确认漏洞路径被阻断且正常路径保留。

## 反模式

- 只列扫描结果，不做可达性和误报判断。
- 把漏洞标题当证据。
- 只修前端校验，不修服务端边界。
- 输出可直接用于攻击第三方的 payload。
