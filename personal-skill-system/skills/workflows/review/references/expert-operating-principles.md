# Expert Operating Principles

Use this reference when review quality must reflect senior engineering judgement rather than a
surface checklist.

## Order of judgement

1. correctness
2. security
3. regression risk
4. missing tests
5. release and operational risk
6. maintainability

## Core rules

- findings beat summaries
- every significant finding should name why it matters
- approval is a risk judgement, not a politeness ritual
- a review should surface the most expensive mistake first
- style comments should not bury correctness comments

## Failure modes

Watch for:

- commenting on taste while missing behavior breakage
- calling something risky without naming the scenario
- assuming tests imply correctness without reading assertions
- reviewing code without reconstructing the changed contract
- approving because the diff is small even when the blast radius is not

## Strong review output

Each meaningful finding should contain:

- what is wrong
- where it is
- why it matters
- what remains uncertain

## Approval bar

Approve only when:

- no unaddressed correctness or security issue remains
- validation scope matches change scope
- the remaining unknowns are explicitly acceptable
