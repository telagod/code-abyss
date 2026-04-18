# Expert Findings And Severity

Use this reference when the review needs sharper severity judgement.

## Severity order

1. correctness
2. security
3. regression risk
4. missing tests
5. release and operational risk
6. maintainability

## Core rules

- findings beat summaries
- one strong finding is worth more than ten weak style comments
- severity should name the failure scenario, not only the reviewer emotion

## Strong severity prompts

- what breaks
- who is affected
- under what condition it fails
- why this matters now rather than later

## Anti-patterns

- calling everything \"high risk\"
- burying a correctness issue below style comments
- describing the code smell without naming the failure

## Output contract

Leave behind:

- severity
- failure scenario
- file location
- remaining uncertainty
