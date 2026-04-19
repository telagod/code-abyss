# Expert Cause Model And Proof

Use this reference when the review should judge whether a fix is backed by an actual cause model.

## Core rules

- a serious fix should imply a cause hypothesis
- symptom repair without mechanism proof is weak assurance
- RCA language should not outrun the evidence

## Strong questions

- what exact mechanism caused the defect
- what evidence points to that mechanism
- what was ruled out

## Cause-model strength ladder

- weak: correlation only, no mechanism evidence
- medium: plausible mechanism with partial proof and unresolved alternatives
- strong: mechanism reproduced with clear trigger and boundary conditions
- decisive: mechanism reproduced and prevented by targeted fix plus regression evidence

## Proof requirements

- reproduction evidence that isolates trigger and boundary inputs
- instrumentation or logs showing causal chain, not only final symptom
- disproof evidence for main competing hypotheses
- post-fix verification that mechanism cannot recur under same trigger

## Reviewer checks

- does the fix change the causal mechanism or only mask symptom
- does test evidence target mechanism-level regression
- does rollout plan account for residual uncertainty in production conditions
- does explanation distinguish known facts from inference

## Anti-patterns

- root cause declared before reproducing the defect
- broad refactor merged as "fix" without causal justification
- one flaky test interpreted as mechanism proof
- unresolved alternatives omitted from review narrative

## Output contract

Leave behind:

- cause model strength
- evidence quality
- remaining uncertainty
- disconfirmed alternatives
