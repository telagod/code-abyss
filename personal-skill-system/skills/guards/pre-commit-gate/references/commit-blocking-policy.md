# Commit Blocking Policy / 提交阻断策略

## 1. Commit Gates Should Be Conservative, Not Paralyzing

A pre-commit gate should usually block only when:

- regression risk is obvious
- documentation absence hides module intent
- warnings indicate likely breakage

## 2. Review Questions

- is this severe enough to stop local history
- would a warning plus follow-up be enough instead
