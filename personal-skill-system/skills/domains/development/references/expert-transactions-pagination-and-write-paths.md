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

## Output contract

Leave behind:

- transaction scope
- write-path risk
- pagination stance
- safer persistence alternative

