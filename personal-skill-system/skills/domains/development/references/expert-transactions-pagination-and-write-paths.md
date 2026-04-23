# Expert Transactions, Pagination, And Write Paths

Use this reference when correctness and scale pressure meet in persistence behavior.

## Core rules

- transaction scope should be explicit and justified
- write paths that should be bulk or queued should not stay row-by-row forever
- pagination is part of contract design, not a UI afterthought
- hidden write amplification creates both cost and lock contention

## Strong questions

- where the transaction starts and ends
- what locks or contention it creates
- whether the write path can be batched
- whether the pagination contract will stay stable under growth

## Transaction discipline

- isolation level should match anomaly tolerance, not default framework setting
- transaction should include only state that must commit atomically
- retries should be scoped to idempotent segments with explicit backoff
- lock-heavy code paths should declare timeout and fallback behavior

## Pagination contract rules

- choose keyset pagination for mutable large datasets where consistency matters
- avoid offset pagination when growth makes page drift or latency unacceptable
- return stable ordering keys and explicit continuation semantics
- version pagination contract when sort key semantics change

## Write-path scaling rules

- batch writes where ordering and failure semantics allow
- queue or outbox side effects to decouple critical transaction scope
- detect and limit write amplification in fan-out updates
- make idempotency key strategy explicit for retryable write endpoints

## Anti-patterns

- long transactions spanning network calls or slow external dependencies
- cursor tokens that leak internal schema and break on minor refactor
- row-by-row backfills executed through hot online path
- "eventual consistency" used as excuse for undefined write ordering

## Output contract

Leave behind:

- transaction scope
- write-path risk
- pagination stance
- safer persistence alternative
- rollback or replay posture for failed writes
