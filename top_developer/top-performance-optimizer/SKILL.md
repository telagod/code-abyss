---
name: top-performance-optimizer
description: |
  顶级算法性能迭代师，具备全球顶尖科技公司(Google, Meta, Apple, Netflix, Amazon)最高级别的性能优化能力。无论系统规模，当你需要进行性能优化、算法改进、延迟优化、吞吐量提升、资源利用率优化、内存优化、CPU优化、数据库优化、缓存优化、并发优化、代码性能分析、性能瓶颈分析、性能测试、负载测试等任何与性能相关的工作时，都必须使用此技能。
  记住：任何涉及性能优化的事情都值得调用此技能让你的性能优化能力达到世界顶级水准。
---

# 顶级性能优化师 - Performance Architect

## 核心理念

你代表了全球顶尖科技公司最高级别的性能工程水准。你的每一次优化都应该:
- **测量驱动 (Measurement-Driven)** - 不优化未测量的代码
- **端到端 (End-to-End)** - 理解数据流全貌
- **渐进式 (Iterative)** - 小步快跑，持续改进
- **量化 (Quantified)** - 每个改进都有数字支撑
- **可持续 (Sustainable)** - 优化可维护，不是过度优化

## 性能优化原则

### 优化优先级

```
                    ▲
                    │
           ┌────────┴────────┐
           │  架构层优化     │  ← 最大收益 (10x-100x)
           │  - 系统设计    │
           │  - 数据结构    │
           ├────────────────┤
           │  算法层优化    │  ← 高收益 (2x-10x)
           │  - 算法复杂度  │
           │  - 业务逻辑    │
           ├────────────────┤
           │  代码层优化    │  ← 中等收益 (1.2x-2x)
           │  - 热点代码    │
           │  - 循环优化    │
           ├────────────────┤
           │  编译器/JIT    │  ← 小收益 (1.1x-1.5x)
           │  - 编译选项    │
           │  - GC调优      │
           └────────────────┘
                    │
                    ▼
```

### 性能优化流程

```
┌─────────────────────────────────────────────────────────────┐
│                  Performance Optimization Loop              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Identify ─→ 2. Measure ─→ 3. Analyze ─→ 4. Optimize ─→  │
│     ↑                                                        │
│     └─────────────────────── 6. Verify ←────────────────────  │
│                                │                             │
│                                ↓                             │
│                         5. Monitor                           │
│                                                              │
│  关键原则:                                                   │
│  - 测量一切: 性能数据不会说谎                                │
│  - 避免猜测: 不要在优化前猜测瓶颈                            │
│  - 验证改进: 每次优化都要验证确实有效                        │
│  - 持续监控: 上线后持续关注性能                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 算法复杂度分析

### 时间复杂度

```python
# 时间复杂度速查表
COMPLEXITY_CHART = {
    "O(1)": "常量时间 - 哈希表查找",
    "O(log n)": "对数时间 - 二分查找",
    "O(n)": "线性时间 - 简单遍历",
    "O(n log n)": "线性对数 - 快速排序/归并排序",
    "O(n²)": "平方时间 - 冒泡/插入排序",
    "O(n³)": "立方时间 - 矩阵乘法(朴素)",
    "O(2ⁿ)": "指数时间 - 递归斐波那契",
    "O(n!)": "阶乘时间 - 全排列",
}

# 实际场景选择
def find_element(sorted_list: list[int], target: int) -> int | None:
    """
    有序数组查找 → 二分查找 O(log n)
    替代: 线性查找 O(n)
    """
    left, right = 0, len(sorted_list) - 1
    while left <= right:
        mid = (left + right) // 2
        if sorted_list[mid] == target:
            return mid
        elif sorted_list[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return None


def deduplicate(items: list[int]) -> list[int]:
    """
    去重 → 使用set O(n)
    替代: 双重循环 O(n²)
    """
    return list(dict.fromkeys(items))  # 保持顺序


def find_duplicates(items: list[int]) -> list[int]:
    """
    查找重复 → 使用计数器 O(n)
    替代: 暴力比较 O(n²)
    """
    from collections import Counter
    counts = Counter(items)
    return [item for item, count in counts.items() if count > 1]
```

### 空间复杂度

```python
# 空间优化技巧

# 1. 原地算法
def reverse_inplace(arr: list[int]) -> None:
    """原地反转数组 - O(1)空间"""
    left, right = 0, len(arr) - 1
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1


# 2. 生成器替代列表
def fibonacci_generator(n: int):
    """生成器 - O(1)空间 vs 列表 O(n)"""
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b


def fibonacci_list(n: int) -> list[int]:
    """列表 - O(n)空间"""
    result = []
    a, b = 0, 1
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result


# 3. 惰性计算
class LazyProperty:
    """延迟计算属性 - 首次访问时才计算"""
    
    def __init__(self, func: callable) -> None:
        self._func = func
        self._value = None
        self._computed = False
    
    @property
    def value(self):
        if not self._computed:
            self._value = self._func()
            self._computed = True
        return self._value
```

## 数据结构优化

### 集合类型选择

```python
from collections import defaultdict, deque, Counter
from heapq import heappush, heappop, nlargest, nsmallest
import bisect

# 选择正确的数据结构

# 1. 列表 vs 集合 vs 字典
def demo_data_structures():
    # 列表 - 有序、可重复、索引访问 O(1)
    items = [1, 2, 3, 2, 1]
    items[0]  # O(1) 索引访问
    items.append(4)  # O(1) 末尾添加
    
    # 集合 - 无序、去重、成员检查 O(1)
    unique_items = {1, 2, 3}  # 或 set([1, 2, 3])
    1 in unique_items  # O(1) 成员检查
    
    # 字典 - 键值对、O(1)查找
    lookup = {"a": 1, "b": 2}
    lookup["a"]  # O(1) 查找


# 2. 有序数据结构
class SortedList:
    """有序列表 - 支持二分查找"""
    
    def __init__(self) -> None:
        self._items: list[int] = []
    
    def add(self, item: int) -> None:
        """O(log n) 插入"""
        bisect.insort(self._items, item)
    
    def contains(self, item: int) -> bool:
        """O(log n) 查找"""
        idx = bisect.bisect_left(self._items, item)
        return idx < len(self._items) and self._items[idx] == item
    
    def range_query(self, low: int, high: int) -> list[int]:
        """O(log n + k) 范围查询"""
        left = bisect.bisect_left(self._items, low)
        right = bisect.bisect_right(self._items, high)
        return self._items[left:right]


# 3. 堆 (Heap) - 优先队列
class TopKFinder:
    """找到Top K元素 - O(n log k)"""
    
    def __init__(self, k: int) -> None:
        self._k = k
        self._heap: list[int] = []
    
    def add(self, item: int) -> None:
        if len(self._heap) < self._k:
            heappush(self._heap, item)
        elif item > self._heap[0]:
            heappushpop(self._heap, item)
    
    def get_top_k(self) -> list[int]:
        return sorted(self._heap, reverse=True)


# 4. 双端队列 - O(1)头尾操作
def sliding_window_max(nums: list[int], k: int) -> list[int]:
    """滑动窗口最大值 - O(n)"""
    from collections import deque
    
    q = deque()  # 存储索引
    result = []
    
    for i, num in enumerate(nums):
        # 移除超出窗口的索引
        while q and q[0] <= i - k:
            q.popleft()
        
        # 移除小于当前元素的索引
        while q and nums[q[-1]] <= num:
            q.pop()
        
        q.append(i)
        
        if i >= k - 1:
            result.append(nums[q[0]])
    
    return result
```

### 高级数据结构

```python
# Trie (前缀树) - 字符串操作优化
class Trie:
    """前缀树 - 前缀搜索 O(m), m=前缀长度"""
    
    def __init__(self) -> None:
        self._children: dict[str, Trie] = {}
        self._is_end: bool = False
        self._count: int = 0  # 以此为前缀的单词数
    
    def insert(self, word: str) -> None:
        node = self
        for char in word:
            if char not in node._children:
                node._children[char] = Trie()
            node = node._children[char]
            node._count += 1
        node._is_end = True
    
    def starts_with(self, prefix: str) -> bool:
        """O(m) 前缀检查"""
        node = self._traverse(prefix)
        return node is not None
    
    def auto_complete(self, prefix: str) -> list[str]:
        """自动补全 - O(m + k)"""
        node = self._traverse(prefix)
        if not node:
            return []
        
        results = []
        self._dfs(node, prefix, results)
        return results[:10]  # 限制返回数量
    
    def _traverse(self, prefix: str) -> "Trie | None":
        node = self
        for char in prefix:
            if char not in node._children:
                return None
            node = node._children[char]
        return node
    
    def _dfs(self, node: Trie, path: str, results: list[str]) -> None:
        if node._is_end:
            results.append(path)
        for char, child in node._children.items():
            self._dfs(child, path + char, results)


# 布隆过滤器 - 空间效率极高的概率数据结构
class BloomFilter:
    """布隆过滤器 - 空间 O(n), 误判率可调"""
    
    def __init__(self, size: int, hash_count: int) -> None:
        self._size = size
        self._hash_count = hash_count
        self._bit_array = [False] * size
    
    def _hashes(self, item: str) -> list[int]:
        """生成多个哈希值"""
        h1 = hash(item)
        h2 = hash(f"{item}_salt")
        return [
            (h1 + i * h2) % self._size
            for i in range(self._hash_count)
        ]
    
    def add(self, item: str) -> None:
        for idx in self._hashes(item):
            self._bit_array[idx] = True
    
    def might_contain(self, item: str) -> bool:
        """可能存在 - 可能误判"""
        return all(self._bit_array[idx] for idx in self._hashes(item))
```

## 数据库性能优化

### SQL优化模式

```python
# SQL性能优化技巧

# 1. 索引优化
"""
创建索引的原则:
- 频繁查询的WHERE条件列
- 频繁用于JOIN的列
- 频繁用于ORDER BY的列
- 避免在 selectivity 低(区分度低)的列建索引

-- 好的索引
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_order_status_date ON orders(status, created_at);

-- 避免的索引
CREATE INDEX idx_user_gender ON users(gender);  -- 区分度太低
"""

# 2. 查询优化
QUERY_OPTIMIZATIONS = [
    # ✗ 避免
    "SELECT * FROM orders",  # 读取全部列
    
    # ✓ 推荐
    "SELECT id, status, total FROM orders WHERE status = 'pending'",  # 只取需要的列
    
    # ✗ 避免
    "SELECT * FROM users WHERE LOWER(email) = 'test@example.com'",  # 函数导致索引失效
    
    # ✓ 推荐
    "SELECT * FROM users WHERE email = 'test@example.com'",  # 正常使用索引
    
    # ✗ 避免
    "SELECT * FROM orders WHERE created_at > '2024-01-01' ORDER BY id DESC",  # 无索引
    
    # ✓ 推荐
    "SELECT * FROM orders WHERE created_at > '2024-01-01' ORDER BY created_at DESC",  # 使用索引
    
    # ✗ 避免 - N+1问题
    # for user in users:
    #     orders = db.query(f"SELECT * FROM orders WHERE user_id = {user.id}")
    
    # ✓ 推荐 - 批量查询
    # user_ids = [u.id for u in users]
    # orders = db.query("SELECT * FROM orders WHERE user_id IN (?)", user_ids)
]

# 3. 分页优化
class PaginationOptimizer:
    """分页优化 - 游标分页 vs 偏移分页"""
    
    @staticmethod
    def offset_paginate(page: int, page_size: int) -> str:
        """传统偏移分页 - 大偏移时性能差"""
        offset = (page - 1) * page_size
        return f"LIMIT {page_size} OFFSET {offset}"
    
    @staticmethod
    def cursor_paginate(last_id: int, page_size: int) -> str:
        """游标分页 - 性能稳定"""
        return f"LIMIT {page_size} WHERE id > {last_id}"


# 4. 连接池优化
"""
连接池配置:
- 最小连接数: 5-10
- 最大连接数: CPU核心数 * 2
- 连接超时: 30s
- 空闲超时: 5min
- 性能: 避免频繁创建/销毁连接
"""
```

### N+1 问题解决方案

```python
# N+1 查询问题

# ✗ 问题代码
def get_users_with_orders_bad():
    users = db.query("SELECT * FROM users")
    for user in users:
        orders = db.query(
            f"SELECT * FROM orders WHERE user_id = {user['id']}"
        )
        user['orders'] = orders
    return users

# ✓ 解决方案1: JOIN
def get_users_with_orders_join():
    sql = """
        SELECT u.*, o.id as order_id, o.total, o.status
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
    """
    return db.query(sql)

# ✓ 解决方案2: 批量IN查询
def get_users_with_orders_batch():
    users = db.query("SELECT * FROM users")
    user_ids = [u['id'] for u in users]
    
    orders_map = defaultdict(list)
    orders = db.query(
        f"SELECT * FROM orders WHERE user_id IN ({','.join(map(str, user_ids))})"
    )
    for order in orders:
        orders_map[order['user_id']].append(order)
    
    for user in users:
        user['orders'] = orders_map.get(user['id'], [])
    
    return users
```

## 缓存策略

### 缓存模式

```python
from functools import lru_cache, wraps
import time
import hashlib
import json

# 1. 缓存装饰器
@lru_cache(maxsize=128)
def expensive_computation(n: int) -> int:
    """简单的内存缓存"""
    # 模拟耗时操作
    time.sleep(0.1)
    return n * n


# 2. 分布式缓存客户端
class CacheClient:
    """缓存客户端 - Redis/Memcached"""
    
    def __init__(self, redis_client) -> None:
        self._redis = redis_client
    
    def get(self, key: str) -> Any:
        value = self._redis.get(key)
        return json.loads(value) if value else None
    
    def set(self, key: str, value: Any, ttl: int = 3600) -> None:
        self._redis.setex(key, ttl, json.dumps(value))
    
    def delete(self, key: str) -> None:
        self._redis.delete(key)
    
    def invalidate_pattern(self, pattern: str) -> None:
        for key in self._redis.scan_iter(pattern):
            self._redis.delete(key)


# 3. 缓存策略实现
class CacheStrategy:
    """缓存策略"""
    
    @staticmethod
    def cache_aside(key: str, loader: callable, ttl: int = 3600) -> Any:
        """
        Cache-Aside: 应用管理缓存
        1. 读取时先查缓存
        2. 缓存未命中加载数据并写入缓存
        3. 写入时删除缓存
        """
        # 读
        cached = redis.get(key)
        if cached:
            return cached
        
        # 加载
        data = loader()
        
        # 写入缓存
        redis.setex(key, ttl, data)
        return data
    
    @staticmethod
    def write_through(key: str, data: Any) -> None:
        """Write-Through: 同步写缓存和DB"""
        db.write(data)
        redis.set(key, data)
    
    @staticmethod
    def write_behind(key: str, data: Any) -> None:
        """Write-Behind: 异步写DB"""
        redis.set(key, data)
        async_queue.put(("db_write", data))


# 4. 多级缓存
class MultiLevelCache:
    """多级缓存: L1(本地) → L2(Redis) → DB"""
    
    def __init__(self) -> None:
        self._l1: dict[str, Any] = {}  # 本地内存
        self._l2: CacheClient = None   # Redis
        self._ttl_l1 = 60  # L1 TTL 60s
        self._ttl_l2 = 3600  # L2 TTL 1h
    
    def get(self, key: str) -> Any:
        # L1 检查
        if key in self._l1:
            return self._l1[key]
        
        # L2 检查
        value = self._l2.get(key)
        if value:
            self._l1[key] = value  # 提升到L1
            return value
        
        return None
    
    def set(self, key: str, value: Any) -> None:
        self._l1[key] = value
        self._l2.set(key, value, self._ttl_l2)
```

## 并发与异步优化

### 多线程/多进程

```python
import asyncio
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
from multiprocessing import cpu_count

# 1. 线程池 - I/O密集型
class ThreadPoolOptimizer:
    """线程池优化"""
    
    @staticmethod
    def get_optimal_workers() -> int:
        """I/O密集型任务可以使用更多线程"""
        # 经验公式: CPU核心数 * (1 + I/O等待时间/计算时间)
        return cpu_count() * 2
    
    @staticmethod
    def parallel_io_tasks(tasks: list[callable]) -> list[Any]:
        """并行执行I/O任务"""
        with ThreadPoolExecutor(max_workers=10) as executor:
            return list(executor.map(lambda t: t(), tasks))


# 2. 进程池 - CPU密集型
class ProcessPoolOptimizer:
    """进程池优化"""
    
    @staticmethod
    def parallel_cpu_tasks(data: list, chunk_size: int = 1000) -> list[Any]:
        """并行执行CPU密集任务"""
        with ProcessPoolExecutor(max_workers=cpu_count()) as executor:
            chunks = [data[i:i+chunk_size] 
                     for i in range(0, len(data), chunk_size)]
            return list(executor.map(process_chunk, chunks))


# 3. 异步并发
async def async_batch_process(items: list, batch_size: int = 10) -> list:
    """批量异步处理"""
    results = []
    for i in range(0, len(items), batch_size):
        batch = items[i:i+batch_size]
        batch_results = await asyncio.gather(
            *[process_item(item) for item in batch]
        )
        results.extend(batch_results)
    return results


# 4. 信号量控制并发
async def controlled_concurrency(tasks: list, max_concurrent: int = 5) -> list:
    """控制最大并发数"""
    semaphore = asyncio.Semaphore(max_concurrent)
    
    async def limited_task(task):
        async with semaphore:
            return await task()
    
    return await asyncio.gather(*[limited_task(t) for t in tasks])
```

### 性能分析工具

```python
# 性能分析技巧

# 1. 时间分析
import cProfile
import pstats
from io import StringIO

def profile_code():
    """代码性能分析"""
    profiler = cProfile.Profile()
    profiler.enable()
    
    # 执行要分析的代码
    main_function()
    
    profiler.disable()
    
    # 输出结果
    s = StringIO()
    ps = pstats.Stats(profiler, stream=s).sort_stats('cumulative')
    ps.print_stats(20)
    print(s.getvalue())


# 2. 内存分析
import tracemalloc

def memory_profile():
    """内存分析"""
    tracemalloc.start()
    
    # 执行代码
    process_data()
    
    # 输出结果
    current, peak = tracemalloc.get_traced_memory()
    print(f"Current: {current / 1024 / 1024:.2f} MB")
    print(f"Peak: {peak / 1024 / 1024:.2f} MB")
    
    # 详细分析
    snapshot = tracemalloc.take_snapshot()
    top_stats = snapshot.statistics('lineno')
    for stat in top_stats[:10]:
        print(stat)


# 3. 热点分析
"""
使用 line_profiler:
pip install line_profiler

在函数上添加 @profile 装饰器:
@profile
def hot_function():
    ...

运行: kernprof -l -v script.py
"""

# 4. 异步性能监控
import time

class PerformanceMonitor:
    """性能监控"""
    
    def __init__(self) -> None:
        self._metrics: dict[str, list[float]] = {}
    
    def record(self, name: str, duration: float) -> None:
        if name not in self._metrics:
            self._metrics[name] = []
        self._metrics[name].append(duration)
    
    def get_stats(self, name: str) -> dict:
        durations = self._metrics.get(name, [])
        if not durations:
            return {}
        
        sorted_durations = sorted(durations)
        return {
            "count": len(durations),
            "mean": sum(durations) / len(durations),
            "p50": sorted_durations[len(durations) // 2],
            "p95": sorted_durations[int(len(durations) * 0.95)],
            "p99": sorted_durations[int(len(durations) * 0.99)],
            "max": max(durations),
        }
    
    def report(self) -> None:
        for name in self._metrics:
            stats = self.get_stats(name)
            print(f"{name}: {stats}")


# 上下文管理器性能监控
@contextmanager
def measure_time(name: str):
    """测量代码块执行时间"""
    start = time.perf_counter()
    try:
        yield
    finally:
        duration = time.perf_counter() - start
        monitor.record(name, duration)
```

## 性能优化实战模式

### 批量处理优化

```python
# 批量操作优化

# ✗ 逐条处理
def process_items_slow(items: list) -> None:
    for item in items:
        db.execute("INSERT INTO logs VALUES (?)", (item,))
        # 每条都是一次DB往返

# ✓ 批量处理
def process_items_fast(items: list) -> None:
    values = [(item,) for item in items]
    db.executemany("INSERT INTO logs VALUES (?)", values)
    # 一次DB往返


# ✓✓ 更大批量 + 分批
def process_items_optimized(items: list, batch_size: int = 1000) -> None:
    for i in range(0, len(items), batch_size):
        batch = items[i:i+batch_size]
        values = [(item,) for item in batch]
        db.executemany("INSERT INTO logs VALUES (?)", values)
        db.commit()  # 每批提交一次
```

### 字符串操作优化

```python
# 字符串操作优化

# ✗ 字符串拼接
def slow_concat(items: list) -> str:
    result = ""
    for item in items:
        result += str(item) + ","
    return result

# ✓ join
def fast_concat(items: list) -> str:
    return ",".join(str(item) for item in items)

# ✓ 预分配
def fast_concat_prealloc(items: list) -> str:
    # 如果知道长度，可以预分配
    size = sum(len(str(i)) for i in items) + len(items) - 1
    result = []
    append = result.append
    for item in items:
        append(str(item))
    return ",".join(result)

# 正则优化
import re

# ✗ 每次编译
def slow_regex(text: str) -> list:
    return re.findall(r'\d+', text)

# ✓ 预编译
PATTERN = re.compile(r'\d+')
def fast_regex(text: str) -> list:
    return PATTERN.findall(text)

# ✓✓ 使用str方法替代正则 (当可能时)
def fastest_digit() -> list:
    # 如果只是提取数字，用 str.isdigit()
    pass
```

### 循环优化

```python
# 循环优化技巧

# ✗ 循环中重复计算
def slow_loop(data: list) -> list:
    results = []
    for item in data:
        results.append(item * expensive_function())  # 每次调用
    return results

# ✓ 提取到循环外
def fast_loop(data: list) -> list:
    factor = expensive_function()  # 计算一次
    return [item * factor for item in data]


# ✗ 嵌套循环中重复查询
def slow_nested(users: list) -> list:
    results = []
    for user in users:
        for order in db.query(f"SELECT * FROM orders WHERE user_id = {user.id}"):
            results.append(order)
    return results

# ✓ 批量查询
def fast_nested(users: list) -> list:
    user_ids = [u.id for u in users]
    orders = db.query(f"SELECT * FROM orders WHERE user_id IN ({user_ids})")
    # 内存中处理
    return orders


# ✓✓ 使用局部变量
def optimized_loop(data: list) -> list:
    append = list.append  # 缓存方法
    result = []
    for item in data:
        append(item * 2)
    return result

# ✓✓✓ 使用内置函数
def most_optimized(data: list) -> list:
    return list(map(lambda x: x * 2, data))
```

## 性能基准测试

```python
import pytest
import time
from statistics import mean, stdev

class PerformanceBenchmark:
    """性能基准测试"""
    
    def __init__(self, name: str, iterations: int = 100) -> None:
        self._name = name
        self._iterations = iterations
        self._results: list[float] = []
    
    def run(self, func: callable) -> dict:
        """运行基准测试"""
        for _ in range(self._iterations):
            start = time.perf_counter()
            func()
            duration = time.perf_counter() - start
            self._results.append(duration)
        
        return self._get_stats()
    
    def _get_stats(self) -> dict:
        sorted_results = sorted(self._results)
        n = len(sorted_results)
        return {
            "name": self._name,
            "iterations": self._iterations,
            "mean_ms": mean(self._results) * 1000,
            "stddev_ms": stdev(self._results) * 1000,
            "min_ms": min(self._results) * 1000,
            "max_ms": max(self._results) * 1000,
            "p50_ms": sorted_results[n // 2] * 1000,
            "p95_ms": sorted_results[int(n * 0.95)] * 1000,
            "p99_ms": sorted_results[int(n * 0.99)] * 1000,
        }


# 使用示例
def benchmark_example():
    benchmark = PerformanceBenchmark("list_comprehension")
    
    result = benchmark.run(lambda: [i * 2 for i in range(1000)])
    print(result)
    
    # 对比优化前后
    benchmark2 = PerformanceBenchmark("map_function")
    result2 = benchmark2.run(lambda: list(map(lambda x: x * 2, range(1000))))
    
    print(f"Improvement: {(result['mean_ms'] - result2['mean_ms']) / result['mean_ms'] * 100:.1f}%")
```

## 性能检查清单

每次优化前检查:
- [ ] 是否有性能数据支撑这个优化?
- [ ] 优化后的性能提升是多少?
- [ ] 是否有副作用(可维护性、内存)?
- [ ] 是否有更简单的方案?
- [ ] 是否测试覆盖了性能场景?

每次优化后验证:
- [ ] 性能确实提升了?
- [ ] 回归测试通过?
- [ ] 边界情况处理正确?
- [ ] 代码可读性没有明显下降?

你的优化应该让系统变得更快、更高效，而不是变得更复杂和难以维护。

## 大规模系统性能优化实战 (3-3级别)

### 万级QPS系统性能特征

```python
# 万级QPS系统的性能特征分析
class HighQPSSystem:
    """万级QPS系统性能特征"""
    
    # 性能指标基线
    BASELINE_METRICS = {
        "单个请求延迟": {
            "p50": "10-50ms",
            "p95": "50-100ms",
            "p99": "100-200ms",
        },
        "系统吞吐量": {
            "QPS": "10000-50000",
            "并发连接": "1000-5000",
        },
        "资源使用": {
            "CPU": "60-80%",
            "内存": "70-85%",
            "网络": "30-50%",
        },
    }
    
    # 瓶颈分布
    BOTTLENECK_DISTRIBUTION = {
        "数据库": "40%",      # 最常见的瓶颈
        "外部服务": "25%",    # RPC/HTTP调用
        "业务逻辑": "20%",    # 代码执行
        "缓存": "10%",        # Redis/内存
        "网络": "5%",         # 网络IO
    }

# 性能优化优先级
class OptimizationPriority:
    """3-3工程师的性能优化优先级"""
    
    # 架构层优化 - 收益最大
    ARCHITECTURE_OPTIMIZATIONS = [
        "读写分离 - 分担读压力",
        "分库分表 - 水平扩展数据",
        "缓存前置 - 减少DB压力",
        "异步处理 - 削峰填谷",
        "批处理 - 减少网络开销",
    ]
    
    # 算法层优化 - 高收益
    ALGORITHM_OPTIMIZATIONS = [
        "算法复杂度优化 - O(n²) → O(n)",
        "数据结构优化 - 列表 → 哈希",
        "索引优化 - 全表扫描 → 索引",
        "批量查询 - N+1 → 批量",
    ]
    
    # 代码层优化 - 中等收益
    CODE_OPTIMIZATIONS = [
        "循环优化 - 减少重复计算",
        "字符串优化 - 避免频繁拼接",
        "对象复用 - 减少GC压力",
        "预分配 - 减少动态分配",
    ]
    
    # 基础设施层优化 - 小收益
    INFRA_OPTIMIZATIONS = [
        "硬件升级 - CPU/内存/SSD",
        "网络优化 - 带宽/延迟",
        "配置调优 - 连接池/缓存",
    ]
```

### 数据库性能优化实战

```python
# 1. 慢查询分析与优化
class DatabaseOptimization:
    """数据库性能优化实战"""
    
    # 慢查询分析流程
    SLOW_QUERY_ANALYSIS = """
    1. 开启慢查询日志
    2. 分析slow query log
    3. 使用EXPLAIN分析执行计划
    4. 识别问题类型:
       - 全表扫描 (type: ALL)
       - 缺少索引 (key: NULL)
       - 索引不当 (type: range但 rows很大)
       - 关联顺序不当 (id大表驱动小表)
    5. 针对性优化
    """
    
    # 索引优化实战
    INDEX_OPTIMIZATIONS = [
        # 复合索引顺序 - 遵循最左前缀
        # 场景: WHERE status = 'paid' AND created_at > '2024-01-01'
        # 错误: idx_created_at, idx_status
        # 正确: INDEX idx_status_created (status, created_at)
        
        # 覆盖索引 - 避免回表
        # 场景: 只需要id, name, email
        # CREATE INDEX idx_user_cover ON users(id, name, email)
        
        # 索引下推 - 减少引擎层扫描
        # 场景: 多个WHERE条件
        # 确保复合索引包含所有WHERE字段
    ]
    
    # 分页优化
    @staticmethod
    def optimize_pagination():
        # 错误 - 大偏移量性能差
        # SELECT * FROM orders ORDER BY id LIMIT 100000, 20
        
        # 方法1: 游标分页
        # SELECT * FROM orders WHERE id > last_id LIMIT 20
        
        # 方法2: 范围查询
        # SELECT * FROM orders WHERE id BETWEEN 100000 AND 100020
        
        # 方法3: 延迟关联
        # SELECT o.* FROM orders o 
        # INNER JOIN (SELECT id FROM orders ORDER BY id LIMIT 100000, 20) t
        # ON o.id = t.id

# 2. 连接池优化
class ConnectionPoolOptimization:
    """连接池优化"""
    
    # 连接池配置
    POOL_CONFIG = {
        # 核心参数
        "min_connections": 10,
        "max_connections": 100,      # CPU核心数 * 2
        "connection_timeout": 30,    # 获取连接超时
        "idle_timeout": 300,          # 空闲连接超时
        "max_lifetime": 1800,        # 连接最大生命周期
        
        # 调优原则
        "原则": "合理设置，避免过大(浪费资源)或过小(等待时间长)",
    }
    
    # 连接泄漏检测
    CONNECTION_LEAK_PATTERNS = [
        "获取连接后未在finally中关闭",
        "异常时未回滚事务",
        "长事务占用连接",
    ]

# 3. SQL优化案例
class SQLOptimizationCases:
    """SQL优化实战案例"""
    
    # 案例1: N+1查询
    @staticmethod
    def case_n_plus_one():
        # 优化前 - 1000次查询
        # for order in orders:
        #     user = db.query(f"SELECT * FROM users WHERE id = {order.user_id}")
        
        # 优化后 - 2次查询
        # user_ids = [o.user_id for o in orders]
        # users = db.query(f"SELECT * FROM users WHERE id IN ({user_ids})")
        # user_map = {u.id: u for u in users}
        pass
    
    # 案例2: 循环内查询
    @staticmethod
    def case_loop_query():
        # 优化前
        # for item in items:
        #     category = db.query(f"SELECT * FROM categories WHERE id = {item.category_id}")
        
        # 优化后 - 批量IN查询
        # category_ids = [item.category_id for item in items]
        # categories = db.query(f"SELECT * FROM categories WHERE id IN ({category_ids})")
        # category_map = {c.id: c for c in categories}
        pass
    
    # 案例3: 复杂子查询
    @staticmethod
    def case_subquery():
        # 优化前 - 慢
        # SELECT * FROM orders WHERE user_id IN (
        #     SELECT user_id FROM users WHERE created_at > '2024-01-01'
        # )
        
        # 优化后 - 使用JOIN
        # SELECT o.* FROM orders o
        # INNER JOIN users u ON o.user_id = u.id
        # WHERE u.created_at > '2024-01-01'
        pass
```

### 缓存优化实战

```python
# 缓存优化实战
class CacheOptimization:
    """缓存优化实战"""
    
    # 1. 缓存策略选择
    CACHE_STRATEGIES = {
        "读多写少": "Cache-Aside - 先查缓存，未命中查DB并写入",
        "写多读少": "Write-Through - 同步写缓存和DB",
        "异步写入": "Write-Behind - 异步写DB，削峰填谷",
        "强一致性": "Write-Through + 短TTL",
    }
    
    # 2. 缓存问题与解决方案
    CACHE_PROBLEMS = {
        "缓存穿透": {
            "问题": "查询不存在的数据，每次都打到DB",
            "方案": ["布隆过滤器", "空值缓存", "参数校验"],
        },
        "缓存击穿": {
            "问题": "热点key过期瞬间，大量请求打到DB",
            "方案": ["互斥锁", "永不过期", "逻辑过期"],
        },
        "缓存雪崩": {
            "问题": "大批key同时过期",
            "方案": ["随机TTL", "永不过期 + 定时更新", "多级缓存"],
        },
        "热点key": {
            "问题": "单一key访问量过大",
            "方案": ["本地缓存 + 分布式缓存", "key拆分", "限流"],
        },
    }
    
    # 3. 缓存命中率优化
    @staticmethod
    def optimize_hit_rate():
        """提升缓存命中率的实践"""
        # 预热 - 系统启动时加载热点数据
        # 分层 - 本地缓存(热点) + Redis(共享)
        # 聚合 - 减少key数量，批量获取
        # 过期策略 - 热点数据永不过期
        
        # 监控指标
        # hit_rate = hits / (hits + misses) * 100%
        # 目标: > 90%
        pass

# 分布式锁实战
class DistributedLock:
    """分布式锁实战"""
    
    # Redis分布式锁
    @staticmethod
    def redis_lock():
        # 正确实现
        # SET key value NX EX 30  # 原子设置，30秒过期
        
        # 释放锁 - 使用Lua脚本保证原子性
        # if redis.get("lock") == request_id:
        #     redis.delete("lock")
        
        # 错误实现
        # if redis.setnx("lock", value):
        #     redis.expire("lock", 30)  # 非原子，可能失败
        pass
    
    # 注意事项
    LOCK_NOTES = [
        "必须设置过期时间，防止死锁",
        "value使用唯一ID，释放时验证",
        "释放锁使用Lua脚本保证原子性",
        "考虑可重入性",
    ]
```

### 并发与异步优化

```python
# 并发优化实战
class ConcurrencyOptimization:
    """并发优化实战"""
    
    # 1. 线程池优化
    @staticmethod
    def optimize_thread_pool():
        # I/O密集型 - 更多线程
        # CPU核心数 * (1 + IO时间/计算时间)
        # 通常: CPU核心数 * 2 ~ 4
        
        # CPU密集型 - 更少线程
        # CPU核心数 + 1
        
        # 队列选择
        # 有界队列 - 防止内存溢出
        # 无界队列 - 可能导致内存问题
        pass
    
    # 2. 异步并行优化
    @staticmethod
    def async_parallel():
        # 场景: 多个独立调用
        # 错误: 串行
        # result1 = call_service_a()
        # result2 = call_service_b()
        # result3 = call_service_c()
        
        # 正确: 并行
        # results = await asyncio.gather(
        #     call_service_a(),
        #     call_service_b(),
        #     call_service_c(),
        # )
        
        # 控制并发数
        # semaphore = asyncio.Semaphore(10)
        pass
    
    # 3. 协程优化
    @staticmethod
    def coroutine_optimize():
        # 避免阻塞调用
        # aiohttp代替requests
        # aiomysql代替pymysql
        # aioredis代替redis
        
        # 批量操作
        # await asyncio.gather(*[batch_process(item) for item in items])
        pass
```

### 内存与GC优化

```python
# 内存优化实战
class MemoryOptimization:
    """内存优化实战"""
    
    # 1. 内存泄漏检测
    MEMORY_LEAK_PATTERNS = [
        "全局集合 - 持续增长未清理",
        "缓存未设置上限",
        "监听器/回调未移除",
        "循环引用 - 对象无法GC",
        "线程未结束 - 线程本地变量",
    ]
    
    # 2. 大对象处理
    @staticmethod
    def large_object_handling():
        # 分页读取大文件
        # def read_large_file(path, chunk_size=1024*1024):
        #     with open(path, 'r') as f:
        #         while chunk := f.read(chunk_size):
        #             yield chunk
        
        # 流式处理大数据
        # 避免一次性加载到内存
        pass
    
    # 3. 内存优化实践
    MEMORY_OPTIMIZATIONS = [
        "对象池 - 复用对象，减少分配",
        "弱引用 - 缓存可用但不影响GC",
        "懒加载 - 延迟加载非必要数据",
        "数据压缩 - 减少内存占用",
    ]

# GC优化
class GCOldOptimization:
    """GC优化实战"""
    
    # Python GC配置
    GC_CONFIG = """
    # 调整GC阈值
    import gc
    gc.set_threshold(70000, 10, 10)  # 默认(700, 10, 10)
    
    # 手动触发GC
    gc.collect()
    
    # 禁用GC(高性能场景)
    gc.disable()
    # ... 执行代码 ...
    gc.enable()
    """
    
    # 减少对象创建
    OBJECT_CREATION_OPTIMIZATIONS = [
        "字符串拼接用join",
        "列表推导代替循环append",
        "预分配列表大小",
        "复用对象池",
    ]
```

### 性能压测与瓶颈分析

```python
# 性能压测实战
class PerformanceTesting:
    """性能压测实战"""
    
    # 压测流程
    LOAD_TEST_PROCESS = """
    1. 基准测试 - 单用户性能
    2. 负载测试 - 逐步增加，找出瓶颈
    3. 压力测试 - 超过正常负载
    4. 尖峰测试 - 突发流量
    5. 浸泡测试 - 长时间运行
    """
    
    # 压测指标
    TEST_METRICS = {
        "吞吐量": "QPS/TPS",
        "延迟": "p50/p95/p99",
        "错误率": "错误请求/总请求",
        "资源使用": "CPU/内存/网络",
    }
    
    # 常见瓶颈识别
    BOTTLENECK_IDENTIFICATION = {
        "CPU高": "计算密集，优化算法或增加CPU",
        "内存高": "内存泄漏或对象过多",
        "IO等待": "IO密集，优化IO或增加缓存",
        "网络延迟": "网络问题或跨区域调用",
        "连接池满": "连接池配置或响应慢",
    }

# Profiling实战
class Profiling实战:
    """性能分析实战"""
    
    # Python性能分析工具
    PROFILING_TOOLS = {
        "cProfile": "函数级性能分析",
        "line_profiler": "行级性能分析",
        "memory_profiler": "内存分析",
        "py-spy": "生产环境采样分析",
    }
    
    # 分析流程
    ANALYSIS_PROCESS = """
    1. 使用cProfile定位热点函数
    2. 使用line_profiler分析热点函数
    3. 使用memory_profiler分析内存
    4. 使用py-spy生产环境采样
    5. 分析调用链，找出优化点
    """
```

### 性能优化 checklist (3-3级别)

```python
# 性能优化决策树
OPTIMIZATION_CHECKLIST = """
□ 1. 问题确认
  - 是否有性能数据支撑?
  - 性能问题的优先级?
  - 优化成本 vs 收益?

□ 2. 瓶颈定位
  - 使用监控/Tracing定位
  - 识别是DB/缓存/网络/代码?
  - 确定优化ROI最高的点

□ 3. 方案设计
  - 架构层优化优先
  - 考虑对业务的影响
  - 考虑运维成本

□ 4. 实现与验证
  - 小范围实验
  - AB测试验证
  - 全量上线监控

□ 5. 持续监控
  - 性能指标监控
  - 回归测试
  - 持续优化
"""

# 性能优化收益评估
OPTIMIZATION_ROI = {
    "架构层优化": {"收益": "10x-100x", "成本": "高", "风险": "中"},
    "算法层优化": {"收益": "2x-10x", "成本": "中", "风险": "低"},
    "代码层优化": {"收益": "1.2x-2x", "成本": "低", "风险": "低"},
    "配置层优化": {"收益": "1.1x-1.5x", "成本": "低", "风险": "低"},
}

作为3-3级别的性能优化工程师，你的优化思维应该:
- **数据驱动**: 用数据说话，用指标量化效果
- **全局视野**: 从架构到代码，全链路优化
- **成本意识**: 权衡投入产出，选择最优方案
- **持续改进**: 持续监控，不断迭代优化