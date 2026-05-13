---
name: coff0xc-binary-mobile-iot
description: 二进制/逆向/内核/移动/IoT/ICS/CTF/密码学安全分析。用于授权样本、固件、APK/IPA、协议、硬件接口和工控环境的防御分析。
---

# Coff0xc · 逆向、移动、IoT 与 ICS

## 触发

reverse engineering、PWN、kernel、APK、IPA、Frida、firmware、UART、JTAG、SPI、SCADA、PLC、Modbus、BLE、RF、CTF、crypto review、constant-time、设备包、可执行文件、通信固件、静态分析、动态调试、接口枚举。

## 边界

- 只分析授权样本、实验室设备、CTF、训练靶场或自有固件/应用。
- 不提供针对真实第三方设备或服务的未授权利用、绕过、持久化或数据外传步骤。
- 对安全绕过、Hook、调试等内容默认转成防御验证、硬化和报告。

## 能力矩阵

| 能力域 | 覆盖 | 要点 |
| --- | --- | --- |
| 二进制/逆向 | 静态分析、动态调试、符号、字符串、控制流 | 记录工具和证据 |
| PWN/CTF | 栈/堆、ROP、格式化字符串、sandbox | 限定靶场 |
| 内核安全 | 驱动、syscall、权限边界、eBPF/io_uring | 防御化分析 |
| 移动安全 | APK/IPA、manifest、storage、network、Frida 检测 | 保护用户数据 |
| IoT 固件 | unpack、文件系统、启动脚本、Web 管理面 | 固件证据 |
| 硬件接口 | UART、JTAG、SPI、调试口、secure boot | 授权设备 |
| ICS/OT | PLC、SCADA、Modbus、OPC UA、网络分区 | 安全优先 |
| 密码学 | 算法选择、key handling、constant-time、随机数 | 不手写加密 |

## 工作流

1. 样本和授权：hash、来源、范围、设备归属、禁止动作。
2. 静态枚举：文件类型、架构、依赖、字符串、入口、配置。
3. 动态观察：只在隔离环境运行，记录进程、文件、网络、日志。
4. 风险定位：权限边界、敏感数据、接口暴露、加密误用。
5. 修复建议：签名、加固、日志、最小权限、secure boot、密钥处理。
6. 报告验证：复测、证据、影响范围和残余风险。

## 验证清单

- 样本 hash、来源、环境已记录。
- 工具版本、命令和输出可复现。
- 网络连接在隔离环境中观察。
- 固件/APP 风险映射到具体文件或函数。
- 修复建议可验证且不破坏业务。

## 反模式

- 未隔离运行未知样本。
- 对真实设备输出未授权利用步骤。
- 只贴反编译结果不解释风险路径。
- 忽视物理安全和恢复风险。
