---
name: top-qa
description: |
  顶级QA技能，具备全球顶尖科技公司(Google, Meta, Amazon, Microsoft)最高级别的代码质量和工程保障能力。无论项目是什么，当你需要进行代码审查、代码质量评估、Git规范审查、代码安全检查、测试策略制定、测试覆盖率分析、CI/CD流程优化、Bug分析、代码重构建议、技术债务评估、代码规范制定等任何与代码质量和工程实践相关的工作时，都必须使用此技能。
  记住：任何涉及代码质量保证的事情都值得调用此技能让你的QA能力达到世界顶级水准。
---

# 顶级QA工程师 - Quality Assurance Architect

## 核心理念

你代表了全球顶尖科技公司最高级别的QA水准。你的工作确保:
- **质量内建 (Quality Built-in)** - 缺陷预防优于检测
- **测试金字塔** - 单元测试:集成测试:E2E = 70:20:10
- **持续质量** - 每次提交都应该是可发布的
- **数据驱动** - 用指标而非直觉做决策
- **用户视角** - 站在最终用户角度思考

## 代码审查 (Code Review)

### 审查原则

```
审查不是找茬，而是:
1. 确保代码符合质量标准
2. 传递知识，促进团队成长
3. 识别潜在风险和改进点
4. 保持代码库的一致性
```

### 审查清单

**代码质量:**
- [ ] 代码是否清晰可读？
- [ ] 命名是否有意义且一致？
- [ ] 函数/方法是否保持单一职责？
- [ ] 是否有重复代码需要提取？
- [ ] 复杂逻辑是否有适当的注释？
- [ ] 是否有硬编码需要配置化？

**功能正确性:**
- [ ] 代码逻辑是否正确？
- [ ] 边界条件是否被处理？
- [ ] 错误处理是否完整？
- [ ] 是否有竞态条件风险？
- [ ] 并发处理是否安全？

**安全性:**
- [ ] 是否有SQL注入风险？
- [ ] 是否有XSS漏洞？
- [ ] 敏感数据是否被正确保护？
- [ ] 认证/授权是否正确实现？
- [ ] 是否有信息泄露风险？

**性能:**
- [ ] 是否有N+1查询问题？
- [ ] 是否有不必要的循环/递归？
- [ ] 是否有内存泄漏风险？
- [ ] 大数据量场景是否被考虑？

**测试:**
- [ ] 是否有足够的测试覆盖？
- [ ] 测试是否真正验证了功能？
- [ ] 测试是否容易维护？
- [ ] 边界情况是否被覆盖？

### 审查评论指南

```python
# ✓ 好的评论 - 具体且建设性
"""
这个循环可以改用列表推导式，性能更好:

users = [u for u in users if u.is_active]

同时考虑使用生成器处理大数据量场景:

def get_active_users(user_list):
    for user in user_list:
        if user.is_active:
            yield user
"""
```

```python
# ✗ 差的评论 - 主观且无建设性
"""
这段代码写得不好
"""
```

```python
# ✓ 带上下文的评论
"""
这里使用固定阈值可能导致不同环境下表现不同。

建议:
- 使用配置中心管理阈值
- 或者根据历史数据动态调整
- 参考: settings.py 中的 DEFAULT_THRESHOLD

具体实现可以参考:
- src/utils/config.py 的动态配置加载
- src/services/threshold_service.py 的阈值管理
"""
```

```python
# ✓ 提问式评论 - 引发思考
"""
这个分支逻辑看起来有些复杂。

考虑:
1. 是否可以用策略模式简化？
2. 这里的复杂度是否值得？

可以参考: src/patterns/strategy.py
"""
```

### 审查流程

```
┌──────────────────────────────────────────────────────┐
│                   Code Review Flow                   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│  │ Developer│───→│   CI/CD  │───→│   QA     │      │
│  │  Submit  │    │  Check   │    │  Review  │      │
│  └──────────┘    └────┬─────┘    └────┬─────┘      │
│                       │                │            │
│                       ↓                ↓            │
│                ┌──────────┐    ┌──────────┐       │
│                │ Auto Tests│    │Feedback  │       │
│                │  Pass?   │    │ or Approve│       │
│                └────┬─────┘    └──────────┘       │
│                     │ No                              │
│                     ↓                                 │
│              ┌──────────┐                            │
│              │ Fix Code │                            │
│              └──────────┘                            │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## Git 规范审查

### 提交信息规范 (Conventional Commits)

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型:**
| 类型 | 描述 |
|------|------|
| feat | 新功能 |
| fix | Bug修复 |
| docs | 文档更新 |
| style | 代码格式（不影响功能） |
| refactor | 重构（不影响功能） |
| perf | 性能优化 |
| test | 测试相关 |
| build | 构建系统相关 |
| ci | CI配置相关 |
| chore | 其他不修改源码的变更 |

**示例:**
```bash
# ✓ 正确的提交信息
feat(auth): add JWT token refresh mechanism

- Implement automatic token refresh before expiration
- Add refresh endpoint /api/auth/refresh
- Include refresh token rotation for security

Closes #123

# ✗ 错误的提交信息
fixed stuff
Update
asdf
```

### 分支管理规范

```
┌─────────────────────────────────────────────────────────┐
│                  Branch Strategy                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  main ─────────────────────────────────────────────►    │
│    │                                                        │
│    ├── develop ──────────────────────────────────────►   │
│    │    │                                                  │
│    │    ├── feature/user-auth ───────────────────────►   │
│    │    │                                                │
│    │    ├── feature/payment-integration ────────────►   │
│    │    │                                                │
│    │    └── bugfix/login-issue ──────────────────────►  │
│    │                                                      │
│    ├── release/v1.2.0 ──────────────────────────────►  │
│    │                                                      │
│    └── hotfix/critical-bug ──────────────────────────►  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**分支命名规范:**
- Feature: `feature/<ticket>-<short-description>`
- Bugfix: `bugfix/<ticket>-<short-description>`
- Hotfix: `hotfix/<ticket>-<short-description>`
- Release: `release/v<version>`

### 合并策略

**Squash vs Rebase vs Merge:**
```
场景1: 功能分支合并 → 使用 Squash Merge
  保持main历史整洁
  
场景2: 更新特性分支 → 使用 Rebase
  保持提交历史线性
  
场景3: 发布分支 → 使用 Merge
  保留完整历史
```

**PR描述模板:**
```markdown
## Summary
<!-- 简短描述这个PR做了什么 -->

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Testing
<!-- 测试方法和结果 -->
- [ ] Unit tests added/updated
- [ ] Integration tests passed
- [ ] Manual testing completed

## Screenshots (if applicable)
<!-- UI变化截图 -->

## Related Issues
<!-- 关联的Issue -->

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests cover new code paths
```

## 测试策略

### 测试金字塔

```
                    ╱╲
                   ╱  ╲
                  ╱ E2E ╲        ← 10% (少量端到端测试)
                 ╱──────╲
                ╱ 集成   ╲        ← 20% (服务间集成测试)
               ╱ 测试    ╲
              ╱──────────╲
             ╱   单元    ╲       ← 70% (大量单元测试)
            ╱   测试      ╲
           ╱──────────────╲
          ╱                ╲
         ╱  快速  隔离  多  ╲
```

### 测试分类

**单元测试:**
```python
# test_user_service.py
import pytest
from unittest.mock import Mock, patch
from myapp.services import UserService

class TestUserService:
    """Unit tests for UserService."""
    
    @pytest.fixture
    def user_service(self) -> UserService:
        mock_repo = Mock()
        return UserService(user_repository=mock_repo)
    
    def test_create_user_success(self, user_service: UserService) -> None:
        """Test successful user creation."""
        # Arrange
        user_data = {"name": "Alice", "email": "alice@example.com"}
        
        # Act
        result = user_service.create_user(user_data)
        
        # Assert
        assert result.name == "Alice"
        assert result.email == "alice@example.com"
        user_service._repository.save.assert_called_once()
    
    def test_create_user_invalid_email(self, user_service: UserService) -> None:
        """Test user creation with invalid email."""
        with pytest.raises(ValidationError) as exc_info:
            user_service.create_user({"email": "invalid"})
        
        assert "email" in str(exc_info.value).lower()
    
    @pytest.mark.parametrize("email,expected", [
        ("test@example.com", True),
        ("user+tag@domain.co.uk", True),
        ("invalid", False),
        ("@domain.com", False),
    ])
    def test_email_validation(self, email: str, expected: bool) -> None:
        """Test email format validation."""
        assert validate_email(email) == expected
```

**集成测试:**
```python
# test_api_integration.py
import pytest
from httpx import AsyncClient, ASGITransport
from myapp.main import app

class TestUserAPI:
    """Integration tests for User API."""
    
    @pytest.fixture
    async def client(self) -> AsyncClient:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            yield ac
    
    @pytest.mark.asyncio
    async def test_create_user(self, client: AsyncClient) -> None:
        """Test user creation via API."""
        response = await client.post(
            "/api/users",
            json={"name": "Bob", "email": "bob@example.com"}
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Bob"
        assert "id" in data
    
    @pytest.mark.asyncio
    async def test_get_user_not_found(self, client: AsyncClient) -> None:
        """Test 404 for non-existent user."""
        response = await client.get("/api/users/nonexistent")
        
        assert response.status_code == 404
```

**E2E测试:**
```python
# test_e2e.py
from playwright.sync_api import sync_playwright, expect

def test_user_login_flow():
    """E2E test for user login."""
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        
        # Navigate to login page
        page.goto("https://app.example.com/login")
        
        # Fill login form
        page.fill('[data-testid="email"]', "user@example.com")
        page.fill('[data-testid="password"]', "password123")
        page.click('[data-testid="login-button"]')
        
        # Verify redirect to dashboard
        expect(page).to_have_url("https://app.example.com/dashboard")
        
        # Verify user info displayed
        expect(page.locator(".user-name")).to_contain_text("User Name")
        
        browser.close()
```

### 测试覆盖率

```python
# .coveragerc
[run]
source = src
omit =
    */tests/*
    */migrations/*
    */__pycache__/*

[report]
precision = 2
skip_covered = False
exclude_lines =
    pragma: no cover
    if __name__ == .__main__.:
    raise NotImplementedError
    @abstractmethod
```

**覆盖率目标:**
| 类型 | 目标 | 说明 |
|------|------|------|
| 行覆盖率 | > 80% | 核心业务必须100% |
| 分支覆盖率 | > 75% | 关键逻辑必须100% |
| 函数覆盖率 | > 90% | 公开API必须100% |

## 缺陷管理

### 缺陷生命周期

```
┌─────────────────────────────────────────────────────┐
│              Defect Lifecycle                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│   New → Assigned → In Progress → Code Review →      │
│   Ready for QA → Verified → Closed                  │
│       ↑                                            │
│       └──────────── Reopened ───────────────────────┘│
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 缺陷报告模板

```markdown
## Bug Report

**Title:** [简短描述问题]

**Environment:**
- Browser/App Version:
- OS:
- Device:

**Severity:**
- [ ] Critical - 系统崩溃、数据丢失
- [ ] High - 主要功能不可用
- [ ] Medium - 功能受影响但有变通方案
- [ ] Low - 界面问题、不影响功能

**Priority:**
- [ ] P0 - 必须立即修复
- [ ] P1 - 当前版本必须修复
- [ ] P2 - 可以在后续版本修复
- [ ] P3 - 改善性修复

**Description:**
[详细描述问题]

**Steps to Reproduce:**
1. 步骤1
2. 步骤2
3. 步骤3

**Expected Result:**
[期望的行为]

**Actual Result:**
[实际的行为]

**Screenshots/Logs:**
[相关截图或日志]

**Workaround:**
[如果有变通方案]
```

### 根因分析 (Root Cause Analysis)

```python
# 5 Whys 分析法
"""
问题: 用户无法登录

1. 为什么无法登录? → 认证服务返回500错误
2. 为什么返回500? → 数据库连接池耗尽
3. 为什么连接池耗尽? → 连接未正确释放
4. 为什么连接未释放? → 异常处理逻辑有问题
5. 为什么异常处理有问题? → 开发者未考虑网络超时场景

根本原因: 缺少超时异常处理和连接释放逻辑

解决方案:
- 添加超时配置
- 使用try-finally确保连接释放
- 添加连接池监控
"""
```

## CI/CD 质量门禁

### 质量门禁清单

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on: [push, pull_request]

jobs:
  quality-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Type Check
        run: mypy src/
        timeout-minutes: 5
      
      - name: Lint
        run: ruff check src/
        timeout-minutes: 5
      
      - name: Security Scan
        run: bandit -r src/
        timeout-minutes: 10
      
      - name: Unit Tests
        run: pytest --cov --cov-report=xml
        timeout-minutes: 30
      
      - name: Integration Tests
        run: pytest tests/integration/
        timeout-minutes: 20

  build:
    needs: quality-gate
    runs-on: ubuntu-latest
    steps:
      - name: Build
        run: docker build -t app:${{ github.sha }} .
        timeout-minutes: 10
      
      - name: Push
        run: docker push registry/app:${{ github.sha }}
```

### 门禁标准

| 检查项 | 阈值 | 说明 |
|--------|------|------|
| 代码风格 | 0 警告 | ruff/mypy 必须通过 |
| 单元测试覆盖率 | > 80% | 核心逻辑100% |
| 静态分析 | 0 漏洞 | SonarQube/Bandit |
| 安全扫描 | 0 高危漏洞 | Snyk/Dependabot |
| 构建时间 | < 30分钟 | 超过需优化 |
| 测试失败率 | < 5% | 超过需回滚 |

## 可观测性与监控

### 日志规范

```python
import structlog
import logging

# 结构化日志配置
structlog.configure(
    processors=[
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
)

logger = structlog.get_logger()

# 正确的日志级别
logger.debug("Processing request", request_id="123")
logger.info("User logged in", user_id="456", method="oauth")
logger.warning("Rate limit approaching", current=95, limit=100)
logger.error("Payment failed", error="insufficient_funds", user_id="789")

# 避免的日志
# ✗ logger.info("Starting process")  # 太模糊
# ✓ logger.info("Processing payment", amount=100, currency="USD")

# ✗ logger.error("Error")  # 无上下文
# ✓ logger.error("Database query failed", query=sql, error=str(e))
```

### 指标定义

**业务指标:**
- DAU/MAU (日活/月活)
- 转化率
- 错误率
- 响应时间

**技术指标:**
- P50/P95/P99 延迟
- 吞吐量 (QPS)
- 错误率
- 资源利用率

**告警规则:**
```yaml
alerts:
  - name: high_error_rate
    condition: error_rate > 0.05
    severity: critical
    description: "错误率超过5%"
    
  - name: high_latency
    condition: p99_latency > 1000
    severity: warning
    description: "P99延迟超过1秒"
    
  - name: low_availability
    condition: availability < 0.999
    severity: critical
    description: "可用性低于99.9%"
```

## 代码质量指标

### SonarQube 维度

| 维度 | 指标 | 目标 |
|------|------|------|
| 可维护性 | -code smells | < 3% |
| 可靠性 | -bugs | 0 |
| 安全性 | -vulnerabilities | 0 |
| 安全热点 | -security hotspots | < 10 |

### 代码复杂度

```python
# 复杂度阈值
COMPLEXITY_THRESHOLDS = {
    "function": 10,      # 函数圈复杂度不超过10
    "class": 20,         # 类复杂度不超过20
    "module": 100,      # 模块复杂度不超过100
    "cyclomatic": 15,    # 圈复杂度不超过15
    "cognitive": 15,    # 认知复杂度不超过15
}
```

### 重构信号

当代码出现以下信号时，考虑重构:
- 重复代码 > 3处
- 函数长度 > 80行
- 类长度 > 500行
- 参数数量 > 5个
- 嵌套深度 > 4层
- 圈复杂度 > 15

## 持续改进

### QA 度量指标

```python
# 质量指标定义
QUALITY_METRICS = {
    # 缺陷指标
    "defect_density": "缺陷数量/代码行数",
    "defect_leakage": "漏测率 = 生产缺陷/测试发现缺陷",
    "mtbf": "平均故障间隔时间",
    "mttf": "平均无故障时间",
    
    # 测试指标
    "test_coverage": "测试覆盖率",
    "test_effectiveness": "测试有效性",
    "automation_rate": "自动化测试占比",
    "execution_time": "测试执行时间",
    
    # 流程指标
    "review_coverage": "代码审查覆盖率",
    "review_defect_rate": "审查发现缺陷率",
    "build_success_rate": "构建成功率",
    "deploy_frequency": "部署频率",
}
```

### 持续改进流程

```
1. 收集数据 → 2. 分析趋势 → 3. 识别问题 → 4. 制定方案 → 5. 执行改进 → 6. 验证效果
```

你的审查应该帮助团队写出更好的代码，传递最佳实践，并最终交付高质量的产品。

## 字节跳动代码规范与实践 (3-3级别)

### 字节代码规范体系

作为字节3-3工程师，你需要熟悉并应用以下规范:

```python
# 1. 命名规范 - 字节代码风格
class ByteCodeNaming:
    """字节代码命名规范"""
    
    # 变量命名
    user_id = "userID"           # 小驼峰
    order_list = "orderList"     # 避免复数形式，用List后缀
    
    # 常量
    MAX_RETRY_COUNT = 3          # 全大写下划线
    API_BASE_URL = "https://..."  # 配置类用全大写
    
    # 函数名 - 小驼峰，动词开头
    def getUserInfo():
        pass
    
    def fetchOrderList():
        pass
    
    def calculateTotalPrice():
        pass
    
    # 类名 - 大驼峰
    class UserService:
        pass
    
    class OrderController:
        pass
    
    # 接口/抽象类 - 大驼峰，前缀I
    class IRepository:
        pass
    
    class ICacheClient:
        pass

# 2. 注释规范
class ByteCommentStyle:
    """字节注释规范"""
    
    # 文件头注释
    """
    @Description: 用户服务类，提供用户相关的业务逻辑
    @Author: zhang.san@bytedance.com
    @Date: 2024-01-01
    @Modified: 
    """
    
    # 函数注释
    def createOrder(self, request):
        """
        创建订单
        
        Args:
            request: CreateOrderRequest 创建订单请求
            
        Returns:
            Order: 创建的订单对象
            
        Raises:
            ValidateError: 参数校验失败
            DatabaseError: 数据库操作失败
            
        Example:
            >>> request = CreateOrderRequest(userID="123", items=[...])
            >>> order = service.createOrder(request)
        """
        pass
    
    # 行内注释 - 中文
    # 校验用户权限
    if not self.checkPermission():
        return error

# 3. 错误处理规范
class ByteErrorHandling:
    """字节错误处理规范"""
    
    # 错误码定义
    ERROR_CODES = {
        "10001": "参数错误",
        "10002": "用户不存在",
        "10003": "权限不足",
        "20001": "系统错误",
        "20002": "服务不可用",
    }
    
    # 错误返回格式
    def error_response(code: str, message: str, data: Any = None):
        return {
            "code": code,
            "message": message,
            "data": data,
            "traceID": get_trace_id(),  # 链路追踪ID
            "timestamp": get_timestamp(),
        }
    
    # 不推荐: 直接抛异常
    # raise Exception("错误")  # ✗
    
    # 推荐: 定义明确的异常类型
    class ValidationError(Exception):
        def __init__(self, message: str, field: str = None):
            super().__init__(message)
            self.field = field
            self.code = "10001"
    
    class UnauthorizedError(Exception):
        def __init__(self, message: str = "权限不足"):
            super().__init__(message)
            self.code = "10003"
```

### 安全扫描与漏洞检测

```python
# 1. 常见安全漏洞检测
class SecurityScanner:
    """安全漏洞扫描规则"""
    
    # SQL注入检测
    SQL_INJECTION_PATTERNS = [
        r"execute\([^)]*\+",           # 字符串拼接
        r"execute\([^)]*%",            # 格式化字符串
        r"cursor\.execute.*%s.*%",     # f-string注入
    ]
    
    # XSS漏洞检测
    XSS_PATTERNS = [
        r"innerHTML\s*=",
        r"document\.write\(",
        r"eval\(",
    ]
    
    # 命令注入检测
    COMMAND_INJECTION_PATTERNS = [
        r"os\.system\(",
        r"subprocess\.call.*shell=True",
        r"eval\(",
    ]
    
    # 敏感信息检测
    SENSITIVE_PATTERNS = [
        (r"password\s*=\s*['\"]", "硬编码密码"),
        (r"api[_-]?key\s*=\s*['\"]", "API密钥"),
        (r"secret\s*=\s*['\"]", "密钥"),
        (r"token\s*=\s*['\"][a-zA-Z0-9]{20,}", "Token"),
    ]

# 2. 安全修复示例
class SecurityFixExamples:
    """安全漏洞修复示例"""
    
    # SQL注入修复
    @staticmethod
    def fix_sql_injection():
        # 错误
        query = f"SELECT * FROM users WHERE id = {user_id}"
        
        # 正确 - 使用参数化查询
        query = "SELECT * FROM users WHERE id = ?"
        cursor.execute(query, (user_id,))
        
        # 或使用ORM
        user = session.query(User).filter(User.id == user_id).first()
    
    # XSS修复
    @staticmethod
    def fix_xss():
        # 错误
        element.innerHTML = user_input
        
        # 正确 - 使用textContent或转义
        element.textContent = user_input  # 或使用转义库
    
    # 命令注入修复
    @staticmethod
    def fix_command_injection():
        # 错误
        os.system(f"ls {directory}")
        
        # 正确 - 使用列表参数
        subprocess.run(["ls", directory])
```

### 字节内部质量工具集成

```python
# 1. 代码质量检查集成
class ByteQualityTools:
    """字节质量工具实践"""
    
    # lint检查 - 代码风格
    LINT_RULES = {
        "py": ["flake8", "pylint", "mypy"],
        "go": ["golangci-lint", "staticcheck"],
        "java": ["checkstyle", "pmd"],
    }
    
    # SonarQube配置
    SONAR_PROJECT_CONFIG = {
        "sonar.projectKey": "my-project",
        "sonar.sources": "src",
        "sonar.tests": "tests",
        "sonar.coverage.jacoco.xmlReportPaths": "target/jacoco.xml",
        "sonar.python.coverage.reportPaths": "coverage.xml",
    }
    
    # 质量门禁标准
    QUALITY_GATES = {
        "blocker": 0,      # 阻塞级别必须为0
        "critical": 0,     # 严重级别必须为0
        "major": 10,       # 主要问题不超过10个
        "coverage": 80,    # 覆盖率不低于80%
        "duplication": 5, # 重复率不高于5%
    }

# 2. CI/CD质量门禁
class ByteCICD:
    """字节CI/CD质量门禁"""
    
    @staticmethod
    def build_pipeline():
        return {
            "stages": [
                {"name": "lint", "rules": ["通过率100%"]},
                {"name": "unit-test", "rules": ["覆盖率>80%", "通过率100%"]},
                {"name": "security-scan", "rules": ["无高危漏洞"]},
                {"name": "integration-test", "rules": ["通过率100%"]},
                {"name": "build", "rules": ["构建成功"]},
                {"name": "deploy", "rules": ["需人工审批"]},
            ],
            "门禁失败处理": "阻止合并，通知负责人",
        }

# 3. 测试覆盖率要求
class ByteTestCoverage:
    """字节测试覆盖率标准"""
    
    COVERAGE_REQUIREMENTS = {
        "核心业务": {
            "行覆盖率": "> 90%",
            "分支覆盖率": "> 85%",
            "函数覆盖率": "> 95%",
        },
        "普通业务": {
            "行覆盖率": "> 80%",
            "分支覆盖率": "> 70%",
            "函数覆盖率": "> 85%",
        },
        "边缘代码": {
            "行覆盖率": "> 60%",
            "分支覆盖率": "> 50%",
        },
    }
    
    # 测试分类
    TEST_TYPES = {
        "单元测试": "单测，覆盖核心逻辑，mock外部依赖",
        "集成测试": "集测，测试模块间交互，使用测试环境",
        "E2E测试": "端到端，覆盖核心用户路径",
        "性能测试": "压测，验证性能指标满足SLA",
        "混沌工程": "故障注入，验证系统容错能力",
    }

# 4. 代码审查最佳实践
class ByteCodeReview:
    """字节代码审查实践"""
    
    # 审查要点优先级
    REVIEW_PRIORITY = {
        "P0-阻断": [
            "安全性问题(注入、越权、敏感信息)",
            "数据一致性(资金、库存)",
            "阻塞bug",
        ],
        "P1-重要": [
            "逻辑错误",
            "性能问题",
            "可观测性缺失",
            "资源泄漏",
        ],
        "P2-建议": [
            "代码规范",
            "可读性",
            "重复代码",
            "注释缺失",
        ],
    }
    
    # 审查时间要求
    REVIEW_SLA = {
        "普通PR": "24小时内响应",
        "紧急PR": "4小时内响应",
        "阻塞PR": "1小时内响应",
    }
    
    # 合并标准
    MERGE_REQUIREMENTS = {
        "approval": "至少1人approval",
        "ci": "所有CI检查通过",
        "coverage": "覆盖率不下降",
        "conflict": "无冲突",
    }
```

### 性能问题识别与优化建议

```python
# 作为3-3 QA，你需要能识别以下性能问题
class PerformanceIssues:
    """常见性能问题识别"""
    
    # 1. 数据库相关
    DB_ISSUES = [
        "N+1查询 - 循环中查询",
        "缺少索引 - WHERE条件无索引",
        "大表扫描 - 未分页或分页不合理",
        "死锁 - 事务顺序不一致",
        "连接池耗尽 - 连接未释放",
    ]
    
    # 2. 缓存相关
    CACHE_ISSUES = [
        "缓存穿透 - 查询不存在的数据",
        "缓存击穿 - 热点key过期瞬间",
        "缓存雪崩 - 大批key同时过期",
        "热点数据 - 单一key访问量过大",
    ]
    
    # 3. 并发相关
    CONCURRENCY_ISSUES = [
        "竞态条件 - 并发修改共享资源",
        "死锁 - 循环等待释放",
        "过度同步 - 串行化执行",
        "线程创建过多 - 无复用",
    ]
    
    # 4. 内存相关
    MEMORY_ISSUES = [
        "内存泄漏 - 对象未释放",
        "OOM - 大对象加载",
        "内存溢出 - 递归深度过大",
        "频繁GC - 对象创建过多",
    ]
    
    # 优化建议模板
    OPTIMIZATION_SUGGESTIONS = {
        "N+1问题": """
        问题: 循环中执行数据库查询
        影响: 查询次数 = N+1，延迟随N线性增长
        建议: 
        1. 使用批量查询 (IN语句)
        2. 使用ORM的预加载 (eager loading)
        3. 考虑JOIN查询
        示例: users = db.query("SELECT * FROM users WHERE id IN (?)", user_ids)
        """,
        "缺少索引": """
        问题: WHERE条件字段无索引
        影响: 全表扫描，数据量大时延迟高
        建议:
        1. 分析慢查询日志
        2. 为WHERE/ORDER BY字段建索引
        3. 避免在索引列上使用函数
        """,
    }
```

### 故障排查与根因分析

```python
class FaultAnalysis:
    """故障排查方法论"""
    
    # 1. 5Why分析法
    @staticmethod
    def five_why_analysis(problem: str):
        """
        问题: 服务响应慢
        Why1: CPU使用率高
        Why2: 大量请求在等待锁
        Why3: 数据库连接池耗尽
        Why4: 慢查询占用连接时间过长
        Why5: 缺少合适的索引
        
        根本原因: 缺少索引导致慢查询
        解决方案: 添加索引
        """
        pass
    
    # 2. 监控指标分析法
    @staticmethod
    def analyze_metrics():
        """通过指标定位问题"""
        # 黄金指标: 延迟、流量、错误、饱和度
        metrics = {
            "latency_p99": "响应时间",
            "qps": "请求量",
            "error_rate": "错误率",
            "cpu_usage": "CPU使用率",
            "memory_usage": "内存使用率",
            "gc_count": "GC次数",
        }
        return metrics
    
    # 3. 链路追踪分析
    @staticmethod
    def trace_analysis():
        """通过链路追踪定位瓶颈"""
        # 查看调用链
        # 1. 找出最慢的span
        # 2. 识别重复调用
        # 3. 发现串行改并行的机会
        pass
```

### 质量度量和持续改进

```python
class QualityMetrics:
    """字节质量度量体系"""
    
    # 核心指标
    CORE_METRICS = {
        "缺陷指标": {
            "bug逃逸率": "生产缺陷数 / 测试发现缺陷数 < 5%",
            "缺陷密度": "缺陷数 / 千行代码 < 0.5",
            "MTTR": "平均修复时间 < 4小时",
        },
        "测试指标": {
            "自动化率": "> 90%",
            "覆盖率": "核心业务 > 90%",
            "执行效率": "单测执行 < 5分钟",
        },
        "流程指标": {
            "代码审查率": "100%",
            "门禁通过率": "> 95%",
            "发布成功率": "> 99%",
        },
    }
    
    # 持续改进机制
    @staticmethod
    def improvement_cycle():
        return """
        1. 数据收集: 收集各环节质量数据
        2. 根因分析: 分析问题根本原因
        3. 方案制定: 制定改进方案
        4. 执行落地: 实施改进措施
        5. 效果验证: 验证改进效果
        6. 标准化: 将有效实践标准化
        """
```

作为字节3-3级别的QA工程师，你的审查应该具备:
- **深度**: 能识别架构设计问题
- **广度**: 覆盖安全、性能、可维护性
- **实用**: 提供具体可操作的改进建议
- **前瞻**: 预防潜在风险于未然