---
name: top-python-dev
description: "顶级Python开发技能，具备全球顶尖科技公司(Google, Meta, Dropbox, Instagram, Spotify)最高级别的Python工程水准。无论项目是什么，当你需要写Python代码、代码重构、项目结构设计、代码优化、Python最佳实践、类型提示、装饰器、异步编程、测试代码、代码审查等任何与Python相关的工作时，都必须使用此技能。记住：任何涉及Python开发的事情都值得调用此技能让你的Python代码达到世界顶级水准。"
---

# 顶级Python开发者 SKILL

世界级 Python 工程师技能指南。涵盖元编程、性能优化、生产工程、架构设计、DDD实践等全维度。

---

## 核心理念

你代表Python语言的最高工程水准。你的代码应该:
- **清晰 (Clear)** - 不言自明的命名和结构
- **简洁 (Concise)** - 一行代码完成更多工作
- **Pythonic** - 遵循Python之禅，用Python的方式思考
- **高效 (Efficient)** - 时间和空间复杂度最优
- **可维护 (Maintainable)** - 未来的自己会感谢现在的自己

## Python之禅践行

```
>>> import this
The Zen of Python, by Tim Peters

Beautiful is better than ugly.
Explicit is better than implicit.
Simple is better than complex.
Complex is better than complicated.
Flat is better than nested.
Sparse is better than dense.
Readability counts.
Special cases aren't special enough to break the rules.
Although practicality beats purity.
Errors should never pass silently.
Unless explicitly silenced.
In the face of ambiguity, refuse the temptation to guess.
There should be one-- and preferably only one --obvious way to do it.
Although that way may not be obvious at first unless you're Dutch.
Now is better than never.
Although never is often better than *right* now.
If the implementation is hard to explain, it's a bad idea.
If the implementation is easy to explain, it may be a good idea.
Namespaces are one honking great idea -- let's do more of those!
```

---

## 核心原则

### 1. Pythonic 思维

- **显式优于隐式**：代码可读性 > 技巧性
- **扁平优于嵌套**：Early return, 避免深层 if-else
- **组合优于继承**：优先组合而非继承层次
- **单一职责**：每个函数/类只做一件事

### 2. 性能直觉

- 理解各操作的时间复杂度
- 知道 Python 的"快"与"慢"
- 避免不必要的抽象（热点路径除外）
- 了解 CPython 实现细节

### 3. 类型意识

- 积极使用类型提示
- 理解 Protocol 和 Generic
- 善用 mypy 严格模式
- 类型推导 > 显式标注（除非影响可读性）

### 4. 防御性编程

- 校验输入，预处理失败
- RAII 资源管理模式
- 明确的错误信息
- 日志记录上下文

---

## 代码风格规范

### 格式化 (PEP 8)

```python
# ✓ 正确的命名
class UserService:  # CapWords for classes
    def __init__(self, user_repository: UserRepository) -> None:
        self._user_repository = user_repository
        self._cache: dict[str, User] = {}
    
    def get_user(self, user_id: str) -> User | None:
        """Get user by ID with caching."""
        if user_id in self._cache:
            return self._cache[user_id]
        
        user = self._user_repository.find_by_id(user_id)
        if user:
            self._cache[user_id] = user
        return user
    
    @property
    def cached_users(self) -> int:
        """Number of cached users."""
        return len(self._cache)

# 正确的import顺序
import os
import sys
from collections.abc import Callable, Iterable
from pathlib import Path

import aiofiles
import orjson  # 第三方库

from myapp.config import Settings
from myapp.models import User, Order
from myapp.services import BaseService
```

### 类型提示 (Type Hints)

```python
from typing import Any, TypeVar, Generic, Protocol, TypeAlias

# dataclass - 数据类最佳实践
from dataclasses import dataclass, field

@dataclass(frozen=True, slots=True)
class User:
    id: str
    name: str
    email: str
    created_at: datetime = field(default_factory=datetime.now)
    
    def __post_init__(self) -> None:
        if not self.email:
            raise ValueError("Email is required")

# Pydantic - 复杂验证
from pydantic import BaseModel, Field, field_validator

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str
    password: str = Field(..., min_length=8)
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        if "@" not in v:
            raise ValueError("Invalid email")
        return v.lower()
```

---

## 深度主题：元编程

### 1. 属性访问协议（__getattr__ 系列）

```python
# 核心区别：
# __getattr__    - 属性未找到时调用（仅当属性不存在时）
# __getattribute__ - 每次属性访问都调用（慎用！）
# __setattr__    - 属性赋值时调用
# __delattr__    - 属性删除时调用

class LazyObject:
    """惰性加载属性的最佳实践"""
    def __init__(self, load_fn):
        self._load_fn = load_fn
        self._cache = {}
    
    def __getattr__(self, name):
        if name.startswith('_'):
            raise AttributeError(name)
        if name not in self._cache:
            self._cache[name] = self._load_fn(name)
        return self._cache[name]

class Proxy:
    """透明代理模式"""
    def __init__(self, target):
        object.__setattr__(self, '_target', target)
    
    def __getattr__(self, name):
        return getattr(self._target, name)
    
    def __setattr__(self, name, value):
        setattr(self._target, name, value)
```

**最佳实践**：
- 避免在 `__getattribute__` 中调用 `getattr()`（无限递归）
- 使用 `object.__getattr__(self, name)` 显式调用父类
- 优先使用 `__getattr__` 而非 `__getattribute__`
- 在 `__setattr__` 中避免递归：使用 `object.__setattr__`

### 2. 描述器协议（Descriptor Protocol）

描述器是 Python 最强大的元编程工具之一。

```python
class Descriptor:
    """描述器模板"""
    def __init__(self, name=None):
        self.name = name
    
    def __set_name__(self, owner, name):
        self.name = name
        self.private_name = f'_{name}'
    
    def __get__(self, obj, objtype=None):
        return getattr(obj, self.private_name, None)
    
    def __set__(self, obj, value):
        setattr(obj, self.private_name, value)

class CachedProperty:
    """单次计算缓存的描述器"""
    def __init__(self, func):
        self.func = func
        self.__doc__ = func.__doc__
    
    def __set_name__(self, owner, name):
        self.name = name
        self.private_name = f'_cached_{name}'
    
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        try:
            return getattr(obj, self.private_name)
        except AttributeError:
            value = self.func(obj)
            setattr(obj, self.private_name, value)
            return value
```

### 3. Metaclass（元类）

```python
class Meta(type):
    """元类模板"""
    def __new__(mcs, name, bases, namespace, **kwargs):
        cls = super().__new__(mcs, name, bases, namespace)
        return cls
    
    def __call__(mcs, *args, **kwargs):
        instance = super().__call__(*args, **kwargs)
        return instance
    
    def __init__(cls, name, bases, namespace, **kwargs):
        super().__init__(name, bases, namespace)
```

**何时使用 Metaclass**：
- 自动注册插件/类
- 强制接口实现
- 类创建时的反射操作
- ORM 模型定义

### 4. 装饰器艺术

```python
import functools
import time
from contextlib import contextmanager

# 性能计时装饰器
def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            return func(*args, **kwargs)
        finally:
            elapsed = time.perf_counter() - start
            print(f"{func.__name__} took {elapsed:.4f}s")
    return wrapper

# 缓存装饰器 (memoization)
def cached(func):
    cache = {}
    
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        key = (args, tuple(sorted(kwargs.items())))
        if key not in cache:
            cache[key] = func(*args, **kwargs)
        return cache[key]
    
    wrapper.cache = cache
    return wrapper

# 重试装饰器
def retry(max_attempts=3, delay=1.0, backoff=2.0, exceptions=(Exception,)):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            current_delay = delay
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    if attempt == max_attempts - 1:
                        raise
                    time.sleep(current_delay)
                    current_delay *= backoff
        return wrapper
    return decorator
```

---

## 深度主题：AST 操作与代码生成

### 1. AST 基础

```python
import ast

code = """
def greet(name: str) -> str:
    return f"Hello, {name}!"
"""

tree = ast.parse(code)
print(ast.dump(tree, indent=2))
```

### 2. AST 转换与生成

```python
class FunctionCallRewriter(ast.NodeTransformer):
    def __init__(self, old_name, new_name):
        self.old_name = old_name
        self.new_name = new_name
    
    def visit_Call(self, node):
        if isinstance(node.func, ast.Name) and node.func.id == self.old_name:
            node.func = ast.Name(id=self.new_name, ctx=ast.Load())
        return node

def transform_code(source: str, transformer: ast.NodeTransformer) -> str:
    tree = ast.parse(source)
    new_tree = transformer.visit(tree)
    ast.fix_missing_locations(new_tree)
    return ast.unparse(new_tree)
```

---

## 深度主题：内存管理与 GC

### 1. Python 内存模型

```
引用计数（reference count）
    │
    ▼
┌─────────────────────────────────────────┐
│         PyObject 结构                   │
│  - ob_refcnt: 引用计数                  │
│  - ob_type:  类型指针                   │
│  - ob_data: 数据                        │
└─────────────────────────────────────────┘
    │
    ▼
循环垃圾回收器（cycle GC）
    │
    ▼
代际回收（Generation GC）
    - Gen 0: 新对象
    - Gen 1: 存活一阵的对象
    - Gen 2: 长期存活的对象
```

### 2. 弱引用

```python
import weakref

class Cache:
    """基于弱引用的缓存"""
    def __init__(self):
        self._cache = weakref.WeakValueDictionary()
    
    def get(self, key):
        return self._cache.get(key)
    
    def set(self, key, value):
        self._cache[key] = value
```

### 3. `__slots__` 优化

```python
class Point:
    __slots__ = ('x', 'y')
    
    def __init__(self, x, y):
        self.x = x
        self.y = y

# 效果对比
# 无 __slots__: ~56 bytes/instance
# 有 __slots__：~40 bytes/instance
```

### 4. GC 调优

```python
import gc

# 调整回收阈值
gc.set_threshold(700, 10, 10)

# 手动触发
gc.collect()

# 禁用/启用
gc.disable()
gc.enable()
```

---

## 深度主题：GIL 与多线程

### 1. GIL 原理

```
┌─────────────────────────────────────────────┐
│           CPython GIL 工作流程               │
├─────────────────────────────────────────────┤
│  1. 每个线程检查 ticker                     │
│  2. 每 1000 ticks 强制释放 GIL             │
│  3. 等待线程被唤醒                          │
│  4. 再次竞争获取 GIL                       │
└─────────────────────────────────────────────┘
```

### 2. 多线程 vs 多进程

| 场景 | 方案 | 原因 |
|------|------|------|
| CPU 密集 | 多进程 | 绕过 GIL |
| IO 密集 | 多线程 | 共享内存，降低开销 |
| 混合 | 多进程 + 多线程 | 结合两者 |
| 大量并发 | asyncio | 单线程事件循环 |

### 3. Threading 最佳实践

```python
import threading
from contextlib import contextmanager

@contextmanager
def acquire(*locks):
    """按固定顺序获取锁避免死锁"""
    locks = sorted(locks, key=id)
    acquired = []
    try:
        for lock in locks:
            lock.acquire()
            acquired.append(lock)
        yield
    finally:
        for lock in reversed(acquired):
            lock.release()
```

### 4. 并发原语

```python
from threading import Lock, Condition, Semaphore

# 线程安全的计数器
class Counter:
    def __init__(self):
        self.value = 0
        self._lock = Lock()
    
    def increment(self):
        with self._lock:
            self.value += 1
            return self.value

# 条件变量（生产者-消费者）
condition = Condition()
```

### 5. multiprocessing

```python
from multiprocessing import Process, Pool

with Pool(processes=4) as pool:
    result = pool.map(heavy_function, items)
```

---

## 深度主题：异步编程

### 1. asyncio 核心

```python
import asyncio

async def main():
    async with asyncio.TaskGroup() as tg:
        tasks = [asyncio.create_task(coro(i)) for i in range(10)]
    
    results = await asyncio.gather(*tasks)

async def bounded_gather(*coros, limit=10):
    semaphore = asyncio.Semaphore(limit)
    
    async def with_sem(coro):
        async with semaphore:
            return await coro
    
    return await asyncio.gather(*(with_sem(c) for c in coros))
```

### 2. anyio 跨框架

```python
import anyio

async def main():
    async with anyio.create_task_group() as tg:
        tg.start_soon(task1)
        tg.start_soon(task2)
```

### 3. trio 深入

```python
import trio

async def main():
    async with trio.open_nursery() as nursery:
        nursery.start_soon(worker1)
        nursery.start_soon(worker2)

async with trio.move_on_after(10):
    await long_operation()
```

---

## 深度主题：Web 框架深度

### 1. FastAPI 核心模式

```python
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field

app = FastAPI(title="API", version="1.0.0")

class Item(BaseModel):
    name: str = Field(..., min_length=1)
    price: float = Field(..., gt=0)

@app.get("/items/{item_id}")
async def get_item(item_id: int, q: str | None = None):
    if item_id not in db:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"item": item_id, "query": q}

# 依赖注入
async def get_db():
    async with pool.acquire() as conn:
        yield conn
```

### 2. SQLAlchemy 2.0+/Async

```python
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))

engine = create_async_engine("sqlite+aiosqlite:///db.sqlite")
```

### 3. Django ORM 高级

```python
from django.db.models import Count, F, Q, Subquery, Exists

# 预加载避免 N+1
users = User.objects.prefetch_related('profile')

# Annotate 聚合
User.objects.annotate(post_count=Count('posts'))

# F 表达式原子更新
User.objects.filter(id=1).update(points=F('points') + 100)

# Q 对象复杂查询
User.objects.filter(Q(groups__name='admin') | Q(is_staff=True))
```

### 4. Flask 扩展

```python
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

app = Flask(__name__)
db = SQLAlchemy(app)
migrate = Migrate(app, db)
```

---

## 深度主题：性能优化

### 1. 性能分析工具

```python
import cProfile
import pstats
import io

def profile(func, *args, **kwargs):
    profiler = cProfile.Profile()
    profiler.enable()
    result = func(*args, **kwargs)
    profiler.disable()
    
    s = io.StringIO()
    ps = pstats.Stats(profiler, stream=s)
    ps.sort_stats('cumulative')
    ps.print_stats(20)
    return s.getvalue()

# py-spy（生产环境）
# py-spy record -o profile.svg -- python app.py
# py-spy top -- python profile.flg
```

### 2. 内存分析

```python
import tracemalloc

tracemalloc.start()
snapshot1 = tracemalloc.take_snapshot()
# ... 运行代码 ...
snapshot2 = tracemalloc.take_snapshot()

top_stats = snapshot2.compare_to(snapshot1, 'lineno')
for stat in top_stats[:10]:
    print(stat)

# objgraph
import objgraph
objgraph.show_most_common_types(limit=20)
```

### 3. 热点优化

```python
# 1. 避免在循环中创建对象
items = []
for x in range(1000):
    items.append(Item(x))

# 2. 使用局部变量
def fast():
    local_list = list
    result = []
    for i in range(1000):
        result.append(local_list([i]))

# 3. 用 __slots__
class Point:
    __slots__ = ('x', 'y')

# 4. 使用 itertools
from itertools import islice

def chunked(it, size):
    it = iter(it)
    while chunk := list(islice(it, size)):
        yield chunk
```

### 4. C 扩展

```python
# Cython 示例
cdef int fib(int n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)

cpdef double dot(double[:] a, double[:] b):
    cdef int n = len(a)
    cdef double result = 0.0
    for i in range(n):
        result += a[i] * b[i]
    return result
```

---

## 深度主题：类型系统

### 1. Protocol（有结构子类型）

```python
from typing import Protocol, runtime_checkable

@runtime_checkable
class Comparable(Protocol):
    def __lt__(self, other) -> bool: ...

def sort[T: Comparable](items: list[T]) -> list[T]:
    return sorted(items)
```

### 2. Generic 深入

```python
from typing import TypeVar, Generic, ParamSpec

T = TypeVar('T')
K = TypeVar('K')
V = TypeVar('V')

class Dict(Generic[K, V]):
    def __getitem__(self, key: K) -> V: ...
    def __setitem__(self, key: K, value: V): ...

P = ParamSpec('P')
def partial(func: Callable[P, T], *args: P.args, **kwargs: P.kwargs) -> Callable[P, T]:
    pass
```

### 3. mypy 插件

```python
from mypy.plugin import Plugin, ClassDefContext

class MyPlugin(Plugin):
    def get_classdef_hook(self, ctx: ClassDefContext):
        if ctx.name == 'Model':
            return model_class_hook
        return None
```

---

## 深度主题：分布式系统

### 1. Celery 深入

```python
from celery import Celery
from celery.signals import task_prerun, task_postrun

app = Celery('tasks')
app.config_from_object('celeryconfig')

@app.task(bind=True, max_retries=3, acks_late=True)
def process(self, data):
    try:
        heavy_work(data)
    except TransientError as e:
        self.retry(countdown=2 ** self.request.retries)

from celery import chain, group, chord

result = chain(taskA.s(), taskB.s(), taskC.s())()
result = group(taskA.s(), taskB.s(), taskC.s())()
```

### 2. Redis Stream

```python
import redis
import json
import time

r = redis.Redis()

def publish(stream, data):
    r.xadd(stream, {'data': json.dumps(data)})

def consume(stream, group, consumer):
    while True:
        messages = r.xreadgroup(
            groupname=group,
            consumername=consumer,
            streams={stream: '>'},
            count=10,
            block=5000
        )
        for stream, msgs in messages:
            for msg_id, data in msgs:
                process(json.loads(data[b'data']))
                r.xack(stream, group, msg_id)
```

### 3. 微服务架构

```python
import json
import time

class ServiceRegistry:
    def __init__(self, redis_client):
        self.redis = redis_client
    
    def register(self, service: str, host: str, port: int):
        self.redis.hset(f"service:{service}", host, json.dumps({
            'host': host, 'port': port, 'registered': time.time()
        }))

# 熔断器
class CircuitBreaker:
    def __init__(self, failure_threshold=5, timeout=60):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failures = 0
        self.state = 'CLOSED'
    
    def call(self, func, *args, **kwargs):
        if self.state == 'OPEN':
            if time.time() - self.last_failure > self.timeout:
                self.state = 'HALF_OPEN'
            else:
                raise CircuitOpenError()
        try:
            result = func(*args, **kwargs)
            self.state = 'CLOSED'
            return result
        except Exception as e:
            self.failures += 1
            if self.failures >= self.failure_threshold:
                self.state = 'OPEN'
            raise

# 限流器
class RateLimiter:
    def __init__(self, rate: int, per: int):
        self.rate = rate
        self.per = per
    
    def acquire(self):
        # Token bucket algorithm
        pass
```

---

## 上下文管理器

```python
from contextlib import contextmanager, suppress, closing

@contextmanager
def timer_context(label: str = "Operation"):
    start = time.perf_counter()
    try:
        yield
    finally:
        elapsed = time.perf_counter() - start
        print(f"{label}: {elapsed:.4f}s")

# suppress - 静默处理特定异常
with suppress(FileNotFoundError):
    os.remove("file.txt")
```

---

## 生成器和迭代器

```python
from collections.abc import Generator, Iterator, Iterable

def fibonacci(n: int) -> Generator[int, None, None]:
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

def natural_numbers(start: int = 1) -> Generator[int, None, None]:
    n = start
    while True:
        yield n
        n += 1

# itertools
from itertools import chain, groupby, islice, pairwise

def pipeline(*functions):
    def compose(data):
        for func in functions:
            data = func(data)
        return data
    return compose
```

---

## 数据结构与算法实现

```python
from collections import deque, defaultdict
from heapq import heappush, heappop

# LRU Cache
class LRUCache:
    def __init__(self, capacity: int):
        self._capacity = capacity
        self._cache = {}
        self._access_order = deque()
    
    def get(self, key):
        if key not in self._cache:
            return None
        self._access_order.remove(key)
        self._access_order.append(key)
        return self._cache[key]
    
    def put(self, key, value):
        if key in self._cache:
            self._access_order.remove(key)
        elif len(self._cache) >= self._capacity:
            lru_key = self._access_order.popleft()
            del self._cache[lru_key]
        self._cache[key] = value
        self._access_order.append(key)

# 优先队列
class PriorityQueue:
    def __init__(self):
        self._heap = []
    
    def push(self, priority, item):
        heappush(self._heap, (priority, item))
    
    def pop(self):
        return heappop(self._heap)[1]

# Trie
class Trie:
    def __init__(self):
        self._children = {}
        self._is_end = False
    
    def insert(self, word):
        node = self
        for char in word:
            if char not in node._children:
                node._children[char] = Trie()
            node = node._children[char]
        node._is_end = True
```

---

## 异常处理最佳实践

```python
class AppError(Exception):
    def __init__(self, message: str, code: str = "APP_ERROR"):
        super().__init__(message)
        self.code = code
        self.message = message

class ValidationError(AppError):
    def __init__(self, message: str):
        super().__init__(message, "VALIDATION_ERROR")

# 异常链
def process_data(data):
    try:
        validate_data(data)
        save_to_database(data)
    except ValidationError as e:
        raise AppError(f"Data processing failed: {e}") from e
```

---

## 依赖注入

```python
from dataclasses import dataclass
from typing import Protocol

class DatabaseProtocol(Protocol):
    def execute(self, query: str): ...
    def query(self, sql: str): ...

class Container:
    def __init__(self):
        self._services = {}
    
    def register(self, interface, factory):
        self._services[interface] = factory
    
    def resolve(self, interface):
        return self._services[interface]()
```

---

## 测试最佳实践

```python
import pytest
from unittest.mock import Mock, AsyncMock, patch

@pytest.fixture
def mock_database():
    db = Mock()
    db.query.return_value = [{"id": "1", "name": "Alice"}]
    return db

@pytest.mark.parametrize("input,expected", [
    (1, 1),
    (2, 4),
    (3, 9),
])
def test_square(input, expected):
    assert input ** 2 == expected

@pytest.mark.asyncio
async def test_async_function():
    with patch("module.function") as mock:
        mock.return_value = AsyncMock()
        result = await async_function()
        assert result is not None
```

---

## 架构设计思维

### 分层架构设计

```python
from abc import ABC, abstractmethod

# 领域层
class Order:
    def __init__(self, order_id: str, amount: float, status: str):
        self.order_id = order_id
        self.amount = amount
        self.status = status
    
    def can_cancel(self) -> bool:
        return self.status in ("pending", "paid")

# 应用层
class OrderService:
    def __init__(self, repo, payment, notification):
        self._repo = repo
        self._payment = payment
        self._notify = notification
    
    def create_order(self, user_id: str, items: list) -> Order:
        order = Order(order_id=self._generate_id(), amount=sum(item["price"] for item in items), status="pending")
        self._repo.save(order)
        self._notify.send(user_id, "订单已创建")
        return order
```

### 领域驱动设计(DDD)

```python
# 聚合根
class AccountAggregate:
    def __init__(self, account_id: str, balance: float = 0):
        self._id = account_id
        self._balance = balance
        self._transactions = []
    
    def deposit(self, amount: float):
        if amount <= 0:
            raise ValueError("存款金额必须为正数")
        self._balance += amount
        self._transactions.append(Transaction("deposit", amount))
    
    def withdraw(self, amount: float):
        if amount <= 0:
            raise ValueError("取款金额必须为正数")
        if amount > self._balance:
            raise ValueError("余额不足")
        self._balance -= amount
        self._transactions.append(Transaction("withdraw", amount))

# 值对象
@dataclass(frozen=True)
class Money:
    amount: float
    currency: str
    
    def add(self, other: "Money") -> "Money":
        if self.currency != other.currency:
            raise ValueError("货币类型不匹配")
        return Money(self.amount + other.amount, self.currency)
```

### 配置管理

```python
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    app_name: str = "MyApp"
    debug: bool = False
    db_host: str
    db_port: int = 5432
    db_name: str
    db_user: str
    db_password: str
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()
```

### 可观测性设计

```python
import structlog

structlog.configure(
    processors=[
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
)

logger = structlog.get_logger(__name__)
```

---

## 生产环境实战

### 日志规范

```python
import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(name)s %(message)s',
)

logger = logging.getLogger(__name__)

logger.info("request_completed", extra={"request_id": "abc123", "duration_ms": 150})
```

### 错误处理

```python
class AppError(Exception):
    def __init__(self, code, message, details=None):
        self.code = code
        self.message = message
        self.details = details or {}
        super().__init__(message)
```

### 监控指标

```python
from prometheus_client import Counter, Histogram, Gauge

requests_total = Counter('app_requests_total', 'Total requests', ['method', 'endpoint'])
request_duration = Histogram('app_request_duration_seconds', 'Request duration')
active_workers = Gauge('app_active_workers', 'Number of active workers')
```

### 健康检查

```python
@app.get("/health")
async def health():
    checks = {"database": check_database(), "redis": check_redis()}
    if all(checks.values()):
        return {"status": "healthy", "checks": checks}
    raise HTTPException(503, "unhealthy")
```

---

## 实战踩坑经验

### 生产环境常见问题

```python
# 问题1: 内存泄漏 - 常见原因
# 错误缓存实现
class BadExample:
    _cache = {}
    
    @classmethod
    def get(cls, key: str):
        if key not in cls._cache:
            cls._cache[key] = cls._load(key)
        return cls._cache[key]

# 正确实现 - 带TTL和大小限制
class LRUCache:
    def __init__(self, max_size=1000, ttl=3600):
        self._max_size = max_size
        self._ttl = ttl
```

### 数据库连接池问题

```python
# 问题: 连接池耗尽
# 正确示例
class ConnectionPool:
    def __init__(self, max_connections=10):
        self._pool = Queue(max_connections)
        for _ in range(max_connections):
            self._pool.put(self._create_connection())
    
    @contextmanager
    def get_connection(self):
        conn = self._pool.get()
        try:
            yield conn
        finally:
            self._pool.put(conn)
```

### 异步编程常见坑

```python
# 坑1: 异步函数中使用了同步阻塞代码
async def good_async():
    await asyncio.sleep(1)  # 正确
    return await some_async_call()

# 坑2: 并发控制不当
async def good_concurrency():
    semaphore = asyncio.Semaphore(100)
    async def limited_process(item):
        async with semaphore:
            return await process_item(item)
    return await asyncio.gather(*[limited_process(item) for item in huge_list])
```

---

## 代码审查清单

### Python 特定
- [ ] 避免全局变量
- [ ] 避免 `from x import *`
- [ ] 使用 f-string（3.6+）
- [ ] 使用 dataclass（3.7+）或 attrs
- [ ] 类型提示完整
- [ ] 异常处理具体
- [ ] 资源使用 context manager
- [ ] 无硬编码配置

### 性能
- [ ] 无 N+1 查询
- [ ] 索引覆盖查询
- [ ] 小对象 __slots__
- [ ] 热点代码 cython 化
- [ ] 异步/多进程选择正确

### 安全
- [ ] 无硬编码密钥
- [ ] SQL 参数化
- [ ] 输入校验
- [ ] CSRF 保护
- [ ] 速率限制

---

## 常用库深度

| 场景 | 推荐库 |
|------|--------|
| Web 框架 | FastAPI（异步优先） |
| ORM | SQLAlchemy 2.0（async） |
| CLI | Click / Typer |
| 并发 | asyncio + anyio |
| 配置 | pydantic-settings |
| 日志 | structlog |
| 监控 | prometheus-client |
| 测试 | pytest + pytest-asyncio |
| HTTP | httpx（async） |
| 缓存 | redis |
| 消息队列 | Redis Stream / Celery |

---

## 工程师成长路径

```python
# Level 1: 实现功能 (初级)
def level1():
    def create_user(name, email):
        db.execute(f"INSERT INTO users VALUES ('{name}', '{email}')")

# Level 2: 代码质量 (中级)
def level2():
    def create_user(name, email):
        if not validate_email(email):
            raise ValueError("Invalid email")
        with get_connection() as conn:
            conn.execute("INSERT INTO users VALUES (?, ?)", (name, email))

# Level 3: 工程实践 (高级)
def level3():
    class UserService:
        def __init__(self, repo, logger, metrics):
            self._repo = repo
            self._logger = logger
            self._metrics = metrics
        
        def create_user(self, request) -> User:
            request.validate()
            user = User.create(name=request.name, email=request.email)
            self._repo.save(user)
            self._logger.info("user_created", user_id=user.id)
            self._metrics.increment("user_created_total")
            return user
```

---

## 触发条件

当用户进行以下任何操作时，必须启用此技能：
1. 编写或修改任何 Python 代码
2. 代码重构或优化
3. 性能分析或调优
4. 编写测试用例
5. 代码审查
6. 项目结构设计
7. API 设计
8. 调试或故障排查
9. 使用任何 Python 库或框架
10. 任何与 Python 编程相关的问题

此技能提供世界级水准的 Python 工程实践，确保代码达到 Google、Meta、Dropbox、Instagram、Spotify 等顶尖公司的质量标准。