---
name: coff0xc-network-protocol-security
description: 网络协议、TLS/DNS/TCP/UDP/QUIC/HTTP、无线/RF/蓝牙、协议日志分析、通信安全和形式化协议建模。用于协议设计审查、抓包分析和安全通信验证。
---

# Coff0xc · 网络与协议安全

## 触发

network protocol、TLS、DNS、HTTP/2、HTTP/3、QUIC、TCP、UDP、WiFi、Bluetooth、BLE、RF、packet、pcap、Wireshark、协议分析、安全通信、ProVerif、Mermaid protocol、抓包、握手、解析异常、加密协商、异常字段、通信流程。

## 边界

- 只分析授权网络、样本 pcap、实验室协议或自有系统。
- 不提供未授权窃听、绕过、干扰、入侵或数据外传步骤。
- 无线/RF 测试必须确认频段、功率、地点和法律边界。

## 能力矩阵

| 能力域 | 覆盖 | 要点 |
| --- | --- | --- |
| 协议设计 | 状态机、消息序列、认证、重放、错误处理 | Mermaid/ProVerif |
| TLS/PKI | cipher、cert chain、mTLS、pinning、rotation | 配置和握手证据 |
| DNS | spoofing、DoH/DoT、zone、cache、logging | 解析链 |
| HTTP/QUIC | headers、cookies、H2/H3、CORS、proxy、cache | 端到端路径 |
| Packet 分析 | pcap、flow、异常字段、重传、握手失败 | 时间线 |
| 无线/BLE/RF | pairing、advertising、GATT、frame、channel | 授权和隔离 |
| 形式化 | ProVerif、sequence diagram、security goal | 假设清楚 |

## 工作流

1. 范围确认：协议、系统、pcap、网络、授权、时间窗。
2. 结构抽取：参与方、消息、状态、密钥、认证点、错误路径。
3. 证据分析：抓包、日志、配置、代码、文档、证书链。
4. 风险判断：重放、降级、认证缺失、明文、解析差异、超时。
5. 修复建议：协议约束、配置、证书、日志、测试向量。
6. 验证闭环：重跑抓包/测试、形式化模型或配置检查。

## 验证清单

- 消息方向和状态转换清楚。
- 加密、认证、重放保护和错误处理已检查。
- pcap 与日志时间线一致。
- 配置建议可落地并有回滚。
- 形式化结论标注假设。

## 反模式

- 只看端口，不看协议状态机。
- 把加密存在等同于认证正确。
- 未授权抓包或无线测试。
- 形式化模型和真实实现脱节。
