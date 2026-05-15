---
name: prompt-and-eval
description: Prompt 工程与模型评估。Prompt 模式（Zero-shot、Few-shot、CoT、ReAct、ToT）、模板设计、RAGAS、LLM-as-Judge、基准测试、A/B 测试、持续监控。当用户提到 Prompt 工程、Few-shot、CoT、模型评估、RAGAS、LLM-as-Judge、基准测试时使用。
---

# Prompt 工程与模型评估

## 一、Prompt 模式

### 模式对比

| 模式 | 复杂度 | 准确性 | Token 消耗 | 适用场景 |
|------|--------|--------|------------|----------|
| Zero-shot | 低 | 中 | 低 | 简单任务、通用问题 |
| Few-shot | 中 | 高 | 中 | 格式化输出、分类 |
| CoT | 中 | 高 | 中 | 推理、数学、逻辑 |
| Self-Consistency | 高 | 极高 | 高 | 关键决策 |
| ToT | 极高 | 极高 | 极高 | 复杂规划 |
| ReAct | 高 | 高 | 高 | 工具调用、Agent |

### Zero-shot

```python
# 关键：清晰指令 + 角色设定 + 输出格式
prompt = """
你是一位资深安全工程师。
任务: 将以下文本分类为正面、负面或中性。
输入: {text}
输出格式: JSON {"sentiment": "...", "confidence": 0.0-1.0}
"""
```

### Few-shot

```python
# 关键：2-5 个高质量示例 + 语义相似度选择
prompt = """
将评论分类:

评论: 音质很棒，佩戴舒适。 → 正面
评论: 电池续航太差。 → 负面
评论: {new_review} →
"""

# 动态示例选择（LangChain）
selector = SemanticSimilarityExampleSelector.from_examples(
    examples, OpenAIEmbeddings(), Chroma, k=2
)
```

### Chain-of-Thought (CoT)

```python
# Zero-shot CoT — 魔法咒语
prompt = f"问题: {question}\n\n让我们一步步思考:"

# Self-Consistency — 多路投票
answers = [extract_answer(llm.predict(prompt, temperature=0.7)) for _ in range(5)]
final = Counter(answers).most_common(1)[0][0]
```

### ReAct

```python
# Thought → Action → Observation 循环
prompt = """
工具: Search[query], Calculate[expr], Finish[answer]

Thought: 我需要查询埃菲尔铁塔高度
Action: Search[埃菲尔铁塔高度]
Observation: 330 米
Thought: 现在知道答案了
Action: Finish[330 米]
"""
```

### Tree-of-Thoughts (ToT)

```python
# 生成多条思路 → 评估打分 → Beam Search 选最优 → 递归扩展
class TreeOfThoughts:
    def solve(self, problem):
        thoughts = self._generate(problem, n=3)
        scored = self._evaluate(problem, thoughts)
        best = sorted(scored, key=lambda x: x[1], reverse=True)[:self.beam_width]
        # 递归深入最佳路径
```

## 二、Prompt 设计技巧

### 模板结构

```python
messages = [
    {"role": "system", "content": "角色 + 能力边界 + 输出约束"},
    {"role": "user", "content": "### 指令\n{task}\n### 输入\n{input}\n### 输出格式\n{format}"},
]
```

### 优化原则

| 原则 | 做 | 不做 |
|------|-----|------|
| 清晰性 | 具体、可执行、有约束 | 模糊指令 |
| 结构化 | 分隔符、编号、格式 | 大段文字 |
| 示例驱动 | 2-5 个高质量示例 | 无示例 |
| 分步指令 | 步骤 1/2/3 | 一句话包办 |
| 约束边界 | 说明要做和不做什么 | 无限制 |

### 高级技巧

```python
# 元提示 — 用 LLM 生成 Prompt
meta = "你是 Prompt 专家。为以下任务生成最优 Prompt: {task}"

# 自我批评 — 生成 → 批评 → 改进
answer = llm(question)
critique = llm(f"批评: {answer}")
improved = llm(f"基于批评改进: {critique}")
```

### Prompt 模板速查

```yaml
代码生成: "生成 {lang} 代码: {desc}。要求: 最佳实践 + 注释 + 异常处理"
文本摘要: "总结为 {n} 字: {text}。保留关键信息，语言简洁"
数据提取: "从文本提取 {fields}，输出 JSON: {text}"
NL2SQL: "将自然语言转 SQL: {query}。表结构: {schema}"
```

## 三、模型评估

### 评估维度

| 维度 | 指标 | 适用场景 |
|------|------|----------|
| 准确性 | Accuracy, F1, Precision, Recall | 分类、NER |
| 相关性 | Relevance, Context Precision | RAG、检索 |
| 忠实性 | Faithfulness, Hallucination Rate | 生成任务 |
| 效率 | Latency P95, Throughput, Cost/1K | 生产部署 |

### RAGAS 框架

```python
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision, context_recall

dataset = Dataset.from_dict({
    "question": questions,
    "answer": answers,
    "contexts": contexts,
    "ground_truth": ground_truths,
})

result = evaluate(dataset, metrics=[
    faithfulness,        # 答案是否基于上下文（0-1）
    answer_relevancy,    # 答案与问题相关度（0-1）
    context_precision,   # 检索上下文中相关信息比例（0-1）
    context_recall,      # 上下文是否包含所需全部信息（0-1）
])
```

### LLM-as-Judge

```python
class LLMJudge:
    def evaluate(self, question, answer, criteria):
        prompt = f"""
评估答案质量（1-5 分）:
问题: {question}
答案: {answer}
标准: {criteria}

输出 JSON: {{"accuracy": N, "completeness": N, "clarity": N, "overall": N, "feedback": "..."}}
"""
        return json.loads(self.llm.predict(prompt))

# 成对比较 + ELO 排名
def pairwise(q, a, b):
    # 返回 {"winner": "A"|"B", "confidence": 0-1}
    ...
```

### 基准测试速查

| 基准 | 评估能力 | 核心指标 |
|------|----------|----------|
| MMLU | 多任务语言理解 | Accuracy |
| HumanEval | 代码生成 | Pass@k |
| GSM8K | 数学推理 | Accuracy (CoT) |
| 自定义 | 业务场景 | 加权评分 + 延迟 |

### 检索指标

```python
def evaluate_retrieval(retrieved, relevant, k=5):
    precision_at_k = len(set(retrieved[:k]) & set(relevant)) / k
    recall_at_k = len(set(retrieved[:k]) & set(relevant)) / len(relevant)
    # MRR: 第一个相关文档的倒数排名
    # NDCG: 归一化折损累积增益
    return {"precision@k": precision_at_k, "recall@k": recall_at_k, "mrr": mrr, "ndcg": ndcg}
```

### 生成指标

```python
# ROUGE: 摘要质量（rouge-1, rouge-2, rouge-l）
# BLEU: 翻译质量
from rouge import Rouge
rouge_scores = Rouge().get_scores(predictions, references, avg=True)
```

## 四、A/B 测试与监控

### A/B 测试

```python
class ABTest:
    def __init__(self, variants):  # [Variant(name, model, ratio)]
        self.variants = variants

    def get_variant(self, user_id):
        # 一致性哈希分流
        return self.variants[hash(user_id) % 100 < cumulative_ratio]

    def check_significance(self, a_scores, b_scores, alpha=0.05):
        t_stat, p_value = stats.ttest_ind(a_scores, b_scores)
        cohens_d = (mean(a) - mean(b)) / pooled_std
        return {"p_value": p_value, "significant": p_value < alpha, "effect": cohens_d}
```

### 持续监控

```python
from prometheus_client import Counter, Histogram, Gauge

request_count = Counter('llm_requests_total', 'Total', ['model', 'status'])
latency = Histogram('llm_latency_seconds', 'Latency', ['model'])
quality = Gauge('llm_quality_score', 'Quality', ['model'])

# 异常检测: Z-score > 2.0 触发告警
class AnomalyDetector:
    def check(self, value):
        z = abs((value - mean(self.window)) / std(self.window))
        return z > self.threshold
```

## 五、Checklist

### Prompt 工程

- 清晰指令 + 角色设定 + 输出格式约束
- 复杂任务用 CoT / ReAct
- 关键决策用 Self-Consistency 多路投票
- 版本管理 Prompt，A/B 测试对比效果
- 迭代优化：测试 → 分析 → 改进

### 模型评估

- 多维度评估：准确性 + 相关性 + 忠实性 + 效率
- RAG 用 RAGAS 四指标
- 自动评估 LLM-as-Judge + 定期人工抽检
- 标准基准（MMLU/HumanEval）+ 业务自定义基准
- 上线前 A/B 测试，上线后持续监控 + 异常告警
- 反馈闭环：收集用户反馈持续改进

## 工具速查

| 工具 | 用途 |
|------|------|
| RAGAS | RAG 专用评估 |
| LangSmith | LLM 应用监控 |
| Phoenix | 可观测性平台 |
| LangChain | Prompt 模板管理 |
| Guidance | 结构化生成 |
| OpenAI Evals | 模型评估框架 |
| W&B | 实验追踪 |

---
