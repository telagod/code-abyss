# Heuristic Chart Scan Boundaries

## What This Tool Is Good At

- catching obvious G2 v4 -> v5 misuse
- flagging malformed chart setup that often fails at runtime
- surfacing chart files that deserve human review before execution

## What It Does Not Prove

- visual correctness
- data correctness
- whether a specific chart choice is semantically optimal
- whether every flagged pattern is truly invalid in local abstractions

## Use Rule

Treat this tool as a fast rule gate, not as a full renderer or AST-backed validator.
If the file uses heavy wrappers or chart factory abstractions, review findings manually.
