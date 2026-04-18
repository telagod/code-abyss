# Expert CI Signal Quality

Use this reference when the review should judge whether CI is producing trustworthy evidence.

## Core rules

- CI should fail on meaningful risk, not cosmetic noise alone
- flaky checks train teams to ignore real failures
- checks that do not cover the changed surface are weak evidence

## Strong questions

- which check proves this change is safe
- which failing check is noisy instead of useful
- whether CI is blind to the actual blast radius

## Signal heuristics

- each important check should map to a specific risk class
- changed surface and gate depth should correlate
- flaky or noisy checks are governance debt, not background weather
- green CI without changed-surface evidence is weak reassurance

## Common CI failures

- passing checks that never touched the risky boundary
- warning-only jobs that hide real release blockers
- expensive checks run everywhere regardless of change class
- teams learning to rerun rather than understand failures

## Output contract

Leave behind:

- signal-quality judgement
- noisy or blind gates
- better evidence path
- release risk note

## Output contract

Leave behind:

- CI signal quality judgement
- blind spots
- stronger gate suggestion
