---
name: coff0xc-identity-zero-trust
description: 身份安全、零信任、AD/Kerberos、IAM、权限、凭证风险、横向移动防御和访问控制审查。用于权限收敛、登录策略和身份治理。
---

# Coff0xc · 身份与零信任

## 触发

IAM、SSO、MFA、AD、Active Directory、Kerberos、BloodHound、权限、凭证、服务账号、提权、横向移动、Zero Trust、PAM、账号权限混乱、谁能访问什么、特权账号收敛、登录策略。

## 边界

- 只做授权目录/租户/账号范围内的只读分析和防御建议。
- 不提供凭证窃取、票据伪造、持久化或未授权横向移动步骤。
- 涉及账户禁用、权限回收、MFA 强制、策略变更前必须确认。

## 能力矩阵

| 能力域 | 覆盖 | 要点 |
| --- | --- | --- |
| 身份治理 | 用户、组、角色、服务账号、生命周期 | owner 和用途 |
| 认证强度 | MFA、SSO、conditional access、password policy | 风险登录路径 |
| 授权模型 | RBAC/ABAC、tenant、object ownership、least privilege | 谁能访问什么 |
| AD/Kerberos | delegation、SPN、group nesting、admin paths | 防御化分析 |
| 凭证风险 | hardcoded secret、long-lived token、shared account | 轮换和撤销 |
| 横向移动防御 | 本地管理员、远程管理、分段、日志覆盖 | 阻断路径 |
| 零信任 | device posture、network segmentation、continuous verification | 控制闭环 |

## 工作流

1. 范围确认：目录/租户、资产、账号类型、只读边界、输出敏感度。
2. 清单梳理：用户、组、角色、服务账号、权限、策略、登录日志。
3. 风险建模：特权路径、共享凭证、弱 MFA、过宽权限、异常登录。
4. 收敛方案：最小权限、PAM、JIT/JEA、分层管理、条件访问。
5. 检测验证：登录异常、权限变更、Kerberos 异常、凭证使用日志。
6. 变更计划：灰度、回滚、例外、业务 owner 确认。

## 验证清单

- 特权账号和服务账号用途明确。
- 高权组成员和嵌套关系已核对。
- 弱 MFA/legacy auth/长期 token 已列出。
- 每个权限回收建议有业务影响和回滚说明。
- 关键身份事件有日志覆盖。

## 反模式

- 只列“开启 MFA”而不看例外和 legacy 协议。
- 不区分用户账号和服务账号。
- 未确认业务 owner 就建议删除权限。
- 输出攻击性 Kerberos 操作步骤。
