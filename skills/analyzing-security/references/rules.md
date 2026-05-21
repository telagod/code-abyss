# 安全规则矩阵 & 危险模式速查

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

### Python

```python
# 危险
eval(user_input)
exec(user_input)
os.system(cmd)
subprocess.run(cmd, shell=True)
pickle.loads(untrusted)
yaml.load(untrusted)  # 老 API
f"SELECT * FROM users WHERE id={user_id}"

# 安全
ast.literal_eval(user_input)
subprocess.run([cmd, arg1, arg2], shell=False)
yaml.safe_load(untrusted)
cursor.execute("SELECT * FROM users WHERE id=%s", (user_id,))
```

### JavaScript / TypeScript

```javascript
// 危险
eval(userInput)
element.innerHTML = userInput
document.write(userInput)
new Function(userInput)

// 安全
JSON.parse(userInput)            // 仅当确认是 JSON
element.textContent = userInput  // 转义文本
// 模板引擎自动转义（React/Vue/Angular 默认）
```

### Go

```go
// 危险
exec.Command("sh", "-c", userInput)
template.HTML(userInput)

// 安全
exec.Command("cmd", arg1, arg2)  // args... 形式
// html/template 自动转义
```

## 误报豁免

若扫描命中但确认非漏洞，添加豁免标记：

```python
# nosec: HARDCODED_SECRET — placeholder for unit tests
TEST_TOKEN = "dummy-token-not-real"
```

```javascript
// nosec: XSS_INNERHTML — sanitized upstream by DOMPurify
container.innerHTML = sanitizedHtml;
```

豁免格式：`# nosec: <规则 ID> — <理由>` 或语言对应注释。

## 输出格式

```
=== 安全扫描报告 ===
扫描路径: /path/to/code
扫描文件: 142
命中规则: 7

[CRITICAL] SQL_INJECTION_DYNAMIC
  文件: src/db/query.py:45
  行: cursor.execute(f"SELECT * FROM users WHERE id={user_id}")
  建议: 使用参数化查询

[HIGH] XSS_INNERHTML
  文件: src/ui/render.js:23
  ...

总计: 1 Critical, 2 High, 3 Medium, 1 Low
```

JSON 模式（`--json`）输出结构化结果，供 CI 解析。
