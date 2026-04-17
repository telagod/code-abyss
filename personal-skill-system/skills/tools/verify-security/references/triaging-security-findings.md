# Triaging Security Findings / 安全发现项分诊

## 1. Triage Order

1. critical
2. high
3. medium
4. benign or fixture-like matches

## 2. Confirm Before Panic

Ask:

- is the match in real code or a rule definition
- is the sink reachable from untrusted input
- what is the blast radius if true
