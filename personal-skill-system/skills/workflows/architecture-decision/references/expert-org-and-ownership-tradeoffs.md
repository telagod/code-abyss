# Expert Org And Ownership Tradeoffs

Use this reference when the architecture decision also changes who builds, owns, or operates the system.

## Questions

- who owns the new boundary
- who is on call after rollout
- what new skill must the team absorb
- what part of the decision creates platform tax
- what governance will stop the architecture from decaying

## Ownership topology

- product ownership: accountable for behavior and user-facing correctness
- platform ownership: accountable for reliability envelope and operational tooling
- integration ownership: accountable for contract compatibility across boundaries
- incident ownership: accountable for first response and recovery decisions

## Rules

- an elegant design with no real owner is a bad decision
- operational complexity counts as product cost
- team capability is a first-class constraint, not an embarrassment

## Capability and tax assessment

- evaluate required skills against current team baseline, not ideal hiring plan
- quantify new operational tax: on-call load, runbook depth, and tooling debt
- quantify interface tax: coordination overhead and release coupling cost
- require transition plan when ownership must move across teams

## Transition and handoff controls

- define ownership cutover date and dual-run window
- define compatibility policy while both old and new boundaries coexist
- define escalation path when owner ambiguity appears during incident
- define success signals that prove ownership transfer is real

## Failure modes

- ownership split across teams with no real incident owner
- platform tax added faster than the team can absorb
- architecture chosen for prestige instead of operability
- governance assumed but not actually assigned

## Anti-patterns

- architecture decision finalized before identifying operator owner
- ownership assigned by org chart only, ignoring runtime boundary reality
- capability gaps labeled "we will learn later" without protected runway
- handoff declared complete without runbook or pager transfer

## Output contract

Leave behind:

- owner map
- new operator burden
- team capability gap
- governance mechanism
- transition plan with decision checkpoints
