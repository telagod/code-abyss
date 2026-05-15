---
name: analyzing-security
description: 安全校验关卡。自动扫描代码安全漏洞，检测危险模式，确保安全决策有文档记录。当魔尊提到安全扫描、漏洞检测、安全审计、代码安全、OWASP、注入检测、敏感信息泄露时使用。在新建模块、安全相关变更、攻防任务、重构完成时自动触发。
license: MIT
compatibility: node>=18
user-invocable: false
disable-model-invocation: false
allowed-tools: Bash, Read, Grep
argument-hint: <扫描路径>
---

# 安全校验关卡

## 命令

```bash
node scripts/security_scanner.js <路径>
node scripts/security_scanner.js <路径> -v           # 详细
node scripts/security_scanner.js <路径> --json       # JSON
node scripts/security_scanner.js <路径> --exclude vendor
```

## 检测矩阵

| 类别 | 检测项 | 严重度 |
|------|--------|--------|
| 注入 | SQL/命令/代码注入 | Critical |
| 敏感信息 | 硬编码密钥、AWS Key、私钥 | Critical |
| XSS | innerHTML、dangerouslySetInnerHTML | High |
| 反序列化 | pickle.loads、yaml.load | High |
| 路径遍历 | 未验证文件路径操作 | High |
| SSRF | 未验证 URL 请求 | High |
| 弱加密 | MD5/SHA1 用于安全场景 | Medium |
| 不安全随机 | random 用于安全场景 | Medium |
| 调试残留 | debugger、pdb.set_trace、breakpoint | Low |

## 危险模式速查

```python
# 危险: eval(), exec(), os.system(), subprocess(shell=True), pickle.loads(), yaml.load(), f"SELECT...{id}"
# 安全: ast.literal_eval(), subprocess([...], shell=False), yaml.safe_load(), cursor.execute("...%s", (id,))
```

```javascript
// 危险: eval(), innerHTML, document.write(), new Function(userInput)
// 安全: JSON.parse(), textContent, 模板引擎自动转义
```

```go
// 危险: exec.Command("sh", "-c", userInput), template.HTML(userInput)
// 安全: exec.Command("cmd", args...), html/template 自动转义
```

## 触发条件

新建模块 | 安全相关变更 | 攻防任务 | 重构完成 | 提交前

## 输出规则

Critical/High 必修后方可交付。安全决策须于 DESIGN.md 记录：威胁模型、信任边界、已知风险。
