# Web / API / GraphQL 应用安全

> 防御视角：把漏洞挡在合并前。每个攻击给 ❌ 错代码 + ✅ 正代码 + 检测信号。

## OWASP API Top 10 (2023)

| ID | 名称 | 防御侧重点 |
|----|------|----------|
| API1 | BOLA (Broken Object Level Authorization) | ownership check 必做 |
| API2 | Broken Authentication | 见 [oauth-and-sessions.md](oauth-and-sessions.md) |
| API3 | BOPLA (Broken Object Property Level Auth) | 字段级白名单 |
| API4 | Unrestricted Resource Consumption | 速率限制 + 复杂度限制 |
| API5 | BFLA (Function Level Authorization) | 角色 → endpoint 矩阵 |
| API6 | Unrestricted Sensitive Business Flows | 业务流速率（注册、转账） |
| API7 | SSRF | 严格白名单 + DNS 解析隔离 |
| API8 | Security Misconfiguration | Header / CORS / Error 不暴露 |
| API9 | Improper Inventory Management | API 资产清单 + 生命周期 |
| API10 | Unsafe Consumption of 3rd-Party APIs | 上游同样不信任 |

## BOLA (API 漏洞之王)

```python
# ❌ 错：仅检查登录，没检查 object 归属
@router.get("/orders/{order_id}")
async def get_order(order_id: int, user: User = Depends(get_current_user)):
    return await db.fetch_one("SELECT * FROM orders WHERE id = :id", {"id": order_id})

# ✅ 正：ownership check + 用 ORM/参数化
@router.get("/orders/{order_id}")
async def get_order(order_id: int, user: User = Depends(get_current_user)):
    order = await Order.get(id=order_id, user_id=user.id)  # AND 条件
    if not order:
        raise HTTPException(404)  # 故意 404 不 403，防止 ID 枚举
    return order
```

**检测信号**：`http_403_total` / `http_404_total{endpoint=/orders/}` 上扬，或单 user 短时访问跨大范围 ID 区间。

## Mass Assignment / BOPLA

```javascript
// ❌ 错：把 req.body 直接 assign
app.post('/users/:id', (req, res) => {
  Object.assign(user, req.body);  // 攻击者可注入 is_admin: true
  user.save();
});

// ✅ 正：显式字段白名单
app.post('/users/:id', (req, res) => {
  const ALLOWED = ['name', 'email', 'avatar'];
  for (const k of ALLOWED) if (k in req.body) user[k] = req.body[k];
  user.save();
});
```

DTO/Pydantic schema 是天然防线：`pydantic.BaseModel` 默认拒绝额外字段（`extra = "forbid"`）。

## SQL 注入

```python
# ❌ f-string、% 拼接、+ 拼接
cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")
cursor.execute("SELECT * FROM users WHERE id = %s" % user_id)

# ✅ 参数化（驱动绑定，非字符串替换）
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
# SQLAlchemy:
session.query(User).filter(User.id == user_id).first()
```

**ORM 误用反例**：`raw()` / `text()` / `extra(where=...)` 仍然可注入，须确认所有用户输入走 `bindparam`。

**NoSQL 注入**（Mongo）：

```javascript
// ❌ 直接 query body
db.users.find({ username: req.body.username, password: req.body.password });
// 攻击：{ "username": "admin", "password": { "$ne": null } } 绕过密码

// ✅ 强制 string 类型
const username = String(req.body.username);
const password = String(req.body.password);
```

## XSS

| 类型 | 入口 | 防御层 |
|------|------|--------|
| Stored | DB → 渲染 | 输出编码 + CSP |
| Reflected | URL/header → 渲染 | 同上 |
| DOM | JS 拼接 → DOM | 用 textContent 而非 innerHTML |

```javascript
// ❌ DOM XSS
container.innerHTML = userInput;
$('.target').html(userInput);

// ✅
container.textContent = userInput;  // 或框架自动转义（React {}/Vue {{}}）
```

**纵深防御**：

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-RANDOM';
  object-src 'none'; base-uri 'self'; require-trusted-types-for 'script'
```

`require-trusted-types-for 'script'` + `Trusted Types` API 让 `innerHTML = string` 直接抛错。

**检测信号**：CSP `report-uri` / `report-to` 收集违规；`/csp-report` endpoint + log。

## SSRF

```python
# ❌ 直接 fetch user URL
@router.get("/preview")
async def preview(url: str):
    return httpx.get(url).text  # 攻击者请求 http://169.254.169.254/latest/meta-data/

# ✅ 多层校验
ALLOWED_SCHEMES = {"http", "https"}
BLOCKED_NETS = [
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("169.254.0.0/16"),  # AWS metadata
    ipaddress.ip_network("100.64.0.0/10"),   # CGNAT
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("fc00::/7"),
]

def safe_url(url: str) -> bool:
    p = urlparse(url)
    if p.scheme not in ALLOWED_SCHEMES: return False
    # DNS 解析后再判（防 DNS rebinding）
    addrs = [ipaddress.ip_address(info[4][0]) for info in socket.getaddrinfo(p.hostname, None)]
    return not any(any(a in n for n in BLOCKED_NETS) for a in addrs)
```

**仍不够**：DNS rebinding 攻击 —— 第一次解析合法，请求时 TTL=0 解析为内网。**最稳的方法是用专门的 egress proxy**（如 smokescreen）或 IMDSv2（`X-aws-ec2-metadata-token`）。

**检测信号**：出站请求到 169.254.169.254 / 元数据域 / 内网网段的次数。

## GraphQL 特有

```graphql
# ❌ 攻击：introspection 暴露所有 schema
{ __schema { types { name fields { name } } } }
```

生产关闭 introspection：Apollo `introspection: false`，或 nginx 层 deny `IntrospectionQuery`。

**Batching 攻击**：

```graphql
# 一个请求 1000 次登录尝试，绕过单 IP 速率限制
[{ login(user: "a", pw: "1") }, { login(user: "a", pw: "2") }, ...]
```

修：限制 batch size + 单字段速率限制（`graphql-rate-limit`）。

**Depth/Complexity 攻击**：

```graphql
# 嵌套查询拖死 DB
{ user { friends { friends { friends { friends { id } } } } } }
```

修：`graphql-depth-limit`（最大深度 7-10）+ 每查询计算 cost：

```javascript
costAnalysis({ maximumCost: 1000, defaultCost: 1, scalarCost: 0, objectCost: 1 })
```

## 反序列化

```python
# ❌ pickle 来自不可信源 = RCE
data = pickle.loads(request.body)
data = yaml.load(request.body)  # PyYAML 老 API

# ✅
data = json.loads(request.body)              # JSON 是数据，不能 RCE
data = yaml.safe_load(request.body)
data = msgpack.unpackb(request.body, raw=False, strict_map_key=True)
```

Java 反序列化（`ObjectInputStream`）：用 `ObjectInputFilter` 白名单类，或全弃 Java 序列化改 JSON/Protobuf。

## 文件上传

```python
# ❌ 信任 filename 和 Content-Type
filename = request.files['f'].filename
request.files['f'].save(f"/uploads/{filename}")  # 路径遍历 + 任意写

# ✅
import secrets, magic
allowed_mime = {"image/jpeg", "image/png", "image/webp"}
data = request.files['f'].read(MAX_SIZE + 1)
if len(data) > MAX_SIZE: raise HTTPException(413)
mime = magic.from_buffer(data, mime=True)  # libmagic 实际探测
if mime not in allowed_mime: raise HTTPException(415)
ext = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}[mime]
new_name = f"{secrets.token_hex(16)}{ext}"  # 自家命名，不用客户端 filename
storage.put(f"uploads/{new_name}", data)
```

**Polyglot 风险**：JPEG + PHP / PDF + JS。修：上传目录禁执行（nginx `location /uploads { ... try_files $uri =404; }` 不解析 PHP）+ 静态资源走独立子域 + Content-Disposition: attachment。

## 路径遍历

```python
# ❌
file_path = f"/data/{request.args['name']}"
return open(file_path).read()

# ✅
import os.path
base = "/data"
target = os.path.realpath(os.path.join(base, request.args['name']))
if not target.startswith(base + os.sep):
    raise HTTPException(403)
return open(target).read()
```

## 检测信号通用清单

| 信号 | 含义 | 阈值 |
|------|------|------|
| `http_4xx_rate_per_user` | 单用户错误率 | >10% / 5min |
| `unique_path_per_user_5min` | 路径枚举尝试 | >50 unique IDs |
| `csp_report_total` | CSP 违规 | 任何非已知违规 |
| `egress_to_metadata_endpoint` | SSRF 命中元数据 | =1 即告警 |
| `graphql_depth_p99` | GraphQL 深度 | >7 |
| `upload_mime_mismatch` | filename ext ≠ libmagic | 任何 |
