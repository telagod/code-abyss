# Module Completeness Rules / 模块完整性规则

## 1. A Complete Module Usually Needs

- source or executable logic
- a minimal README
- design notes for non-trivial behavior
- tests when behavior matters

## 2. Not Every Warning Is Fatal

A tiny script may not need a full design document.
A shared library almost certainly does.

## 3. Review Questions

- what is the actual module boundary
- which missing artifact would hurt maintenance most
- is the module small enough to justify lighter docs
