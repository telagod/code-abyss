# Expert Status And Handoffs

Use this reference when the system needs better reporting, handoff clarity, or phase completion signals.

## Core rules

- status should report facts, not optimism
- handoffs need artifacts, not only summaries
- incomplete work should declare what remains blocked or unknown
- integration should not rediscover decisions already made upstream

## Status model

- state should distinguish not-started, in-progress, blocked, and done-with-proof
- status updates should include evidence link, not only narrative confidence
- blocked state should include blocking dependency and owner to unblock
- completion should include consumable artifact and acceptance result

## Handoff artifact standards

- decision record: what was decided and what alternatives were rejected
- implementation record: what changed and where authoritative source lives
- verification record: what was tested or validated and with what scope
- risk record: what remains unknown, deferred, or downgraded

## Completion and handoff gates

- no handoff without owner-to-owner acknowledgement path
- no completion claim without downstream consumability proof
- no deferred risk without owner, trigger, and follow-up due condition
- no phase close while critical blockers are merely renamed

## Anti-patterns

- status reports optimized for morale rather than risk clarity
- handoff note with no reproducible artifact references
- implicit reassignment of responsibility during incident pressure
- "almost done" state persisting across multiple cycles without proof

## Output contract

Leave behind:

- handoff artifact list
- completion signal
- open blockers
- final integrator context
- next decision owner
- deferred-risk ledger with owners
