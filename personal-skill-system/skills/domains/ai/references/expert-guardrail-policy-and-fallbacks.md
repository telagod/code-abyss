# Expert Guardrail Policy And Fallbacks

Use this reference when the main task is to prevent or contain AI failure rather than only improve capability.

## Core rules

- every guardrail should map to a concrete failure class
- blocking, downgrading, escalating, and abstaining are different responses
- one guardrail is not enough if no fallback or recovery exists
- policy should be visible and reviewable, not buried inside prompts

## Strong questions

- what exact failure the guardrail is preventing
- what fallback happens when the guardrail fires
- whether the policy is too weak, too noisy, or too expensive
- who reviews and tunes the guardrail after incidents

## Failure classes

- policy disallow: output must not be delivered
- confidence collapse: output quality is too uncertain for direct delivery
- tool-risk mismatch: requested action exceeds tool authority for the current task
- grounding failure: evidence cannot support the claim at required assurance

## Response ladder

- block when policy disallow or irreversible-risk requests are detected
- downgrade when confidence is weak but a safer response class is available
- abstain when evidence is insufficient and a reliable downgrade does not exist
- escalate when business impact is high and automation confidence is below threshold

## Policy rules

- low-confidence fallback should be designed before high-confidence output is trusted
- policy logic should be explicit enough to audit and revise
- guardrails that always fire or never fire are both broken
- fallback responses should preserve user progress, not only reject requests

## Tuning loop

- track false-block rate by task class and policy family
- track escaped failure incidents by severity and missed guardrail
- track fallback success rate and downstream rework cost
- review high-impact policy changes on a fixed cadence with named owner

## Anti-patterns

- one global guardrail prompt expected to solve all failure classes
- silent truncation presented as success
- fallback that leaks into unsafe tool path through alternate wording
- policy exceptions added ad hoc without audit trail

## Output contract

Leave behind:

- failure-class-to-response mapping
- fallback path per response mode
- abstention and escalation thresholds
- tuning owner and review cadence
- policy health metrics to watch
