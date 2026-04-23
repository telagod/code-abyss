# Failure Recovery / 失败恢复

## 1. Common Failure Modes

- overlapping edits
- contract mismatch
- hidden dependency
- one stream blocked on another
- partial completion reported as done

## 2. Recovery Rules

- freeze new parallel work when integration is already unstable
- resolve shared contracts before more implementation
- collapse to sequential mode when conflict cost exceeds concurrency gain

## 3. Conflict Handling

When two streams disagree:

1. identify the shared contract
2. choose one decision owner
3. restate the accepted direction
4. re-run integration review

## 4. Escalation Questions

- is the block technical or ownership-based
- can the work be re-split by boundary
- does one stream need to become the dependency-defining stream
- is sequential execution now cheaper than continued coordination
