# Code Implementation And Refactoring / 实现与重构

## 1. Start From The Existing Shape

Before writing code, identify:

- current module boundary
- public contract
- hidden assumptions
- local style and naming rules

Do not impose a new architecture on a small local fix unless the existing shape is already broken.

## 2. Refactor With A Declared Goal

Refactoring must name its intent:

- improve readability
- isolate a dependency
- reduce duplication
- make testing easier
- protect a boundary

If the goal cannot be stated, the refactor is likely vanity work.

## 3. Safe Refactor Rules

- keep behavior stable unless change is intentional
- change one concept at a time
- preserve public contracts first
- prefer extraction over sweeping rewrites
- keep diffs reviewable

## 4. Abstraction Test

Introduce an abstraction only if at least one is true:

- multiple callers already share the pattern
- the boundary has operational value
- testing clearly improves
- a dependency must be isolated

Otherwise, local clarity may beat abstraction.

## 5. Review Questions

- what behavior stays the same
- what boundary becomes clearer
- what code was removed or simplified
- what new contract was introduced
