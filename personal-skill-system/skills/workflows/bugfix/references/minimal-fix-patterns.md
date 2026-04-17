# Minimal Fix Patterns / 最小修复模式

## 1. Fix The Fault, Not The Entire Neighborhood

Prefer:

- guard clause
- boundary normalization
- contract enforcement
- small extraction around the fault

Avoid unrelated cleanup in the same patch unless it is necessary for safety.

## 2. Review Questions

- what is the narrowest correct fix
- what unrelated edits slipped in
