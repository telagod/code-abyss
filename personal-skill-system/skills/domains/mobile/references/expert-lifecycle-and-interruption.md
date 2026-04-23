# Expert Lifecycle And Interruption

## Use

Use this when app resume, process death, navigation restore, or background interruption define correctness.

## Rules

- model foreground, background, kill, and resume explicitly
- assume interruption will happen at the worst possible step
- state restore should preserve intent, not only raw fields
- long-running flows need resumable checkpoints

## Output

- lifecycle model
- restore strategy
- interruption failure modes
