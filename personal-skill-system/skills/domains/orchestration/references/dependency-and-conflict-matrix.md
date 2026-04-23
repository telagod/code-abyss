# Dependency And Conflict Matrix / 依赖与冲突矩阵

## 1. Simple Rule

Two streams may run in parallel only when their write sets and decision surfaces are meaningfully disjoint.

## 2. Conflict Classes

- read/read: safe
- read/write: usually safe if write contract is stable
- write/write same file: unsafe
- write/write same abstraction in different files: also often unsafe

## 3. Dependency Ordering

Order work when:

- one stream defines a shared contract
- one stream changes the data model used by others
- one stream creates scaffolding required by the next

## 4. Blocking Model

For each stream, state:

- owned files or surfaces
- upstream dependencies
- unblock condition
- integration target

## 5. Review Questions

- are two streams editing the same concept under different filenames
- is there a hidden shared config or schema
- who resolves contract disputes
- what happens if one stream slips
