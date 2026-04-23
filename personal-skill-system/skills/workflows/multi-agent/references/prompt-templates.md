# Prompt Templates / 提示模板

## 1. Lead Template

Use this structure:

```text
Objective:
Scope:
Workstreams:
- Stream A owns:
- Stream B owns:
Done criteria:
Integration point:
Do not overlap writes.
```

## 2. Worker Template

```text
You own:
Your task:
Constraints:
- do not edit outside your owned surface
- report blockers immediately
Return:
- changed files or concerns
- validation
- remaining risks
```

## 3. Reviewer Template

```text
Review only.
Prioritize:
1. correctness
2. security
3. regression risk
4. missing tests
Return findings first.
```

## 4. Sequential Fallback Template

When no real subagent system exists, emulate:

1. lead plans
2. worker executes stream A
3. worker executes stream B
4. reviewer inspects integrated result

This preserves role separation even without true parallelism.
