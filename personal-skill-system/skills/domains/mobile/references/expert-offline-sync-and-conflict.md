# Expert Offline Sync And Conflict

## Use

Use this when mobile correctness depends on local writes, queued sync, or conflict handling.

## Rules

- decide what is optimistic, queued, or forbidden offline
- every queued write needs idempotency and retry rules
- conflict resolution must prefer data truth over UI convenience
- stale local state should be visible, not silent

## Output

- offline stance
- sync strategy
- conflict policy
- replay and retry notes
