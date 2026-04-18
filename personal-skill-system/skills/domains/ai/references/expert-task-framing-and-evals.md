# Expert Task Framing And Evals

Use this reference when the hard part is defining what the AI system is actually supposed to do and
how success will be measured.

## Core rules

- task framing comes before prompt wording
- eval target should reflect the real user outcome, not a vanity metric
- one crisp benchmark is worth more than ten vague impressions
- failure categories should be named before iteration begins

## Strong questions

- what user-visible outcome matters
- what exact failure would make the system unacceptable
- what examples should definitely pass
- what examples must definitely fail
- what metric decides whether iteration worked

## Output contract

Leave behind:

- task definition
- benchmark or eval surface
- pass/fail criteria
- dominant failure classes

