# Expert Eval Design And Acceptance

Use this reference when the main problem is how to measure whether the AI system is good enough.

## Core rules

- eval targets should reflect the real deployment risk
- one sharp benchmark is better than a large but meaningless scorecard
- acceptance criteria should define both pass and fail examples
- evaluate failure classes, not only average quality

## Strong questions

- what metric would justify shipping
- what class of failure matters most in production
- what examples should block release even if aggregate score is high
- how often evals must be rerun as context or prompts change

## Eval design rules

- include both representative and adversarial examples
- separate correctness, refusal, latency, and format adherence when they fail differently
- test regression-sensitive classes explicitly instead of only aggregate score
- keep acceptance criteria stable long enough to make iteration meaningful

## Output contract

Leave behind:

- eval suite shape
- acceptance threshold
- must-pass examples
- known blind spots
