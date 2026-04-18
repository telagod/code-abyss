# Expert Operating Principles

Use this reference when mobile work needs platform-grade judgement rather than desktop habits in
a smaller frame.

## Order of judgement

1. lifecycle and interruption model
2. network reality
3. local state and sync model
4. battery and performance budget
5. permission and privacy boundary
6. platform convention fit

## Core rules

- mobile state must survive interruption and resume cleanly
- offline and flaky-network behavior should be explicit, not accidental
- every background action has battery and permission cost
- touch ergonomics and navigation depth are product constraints
- platform conventions buy trust and reduce cognitive load

## Design questions

- what happens if the app is killed mid-flow
- what must work offline or eventually sync
- what user data is cached locally and why
- which permission request is truly justified
- where does cross-platform abstraction hide native cost

## Output contract

Leave behind:

- lifecycle model
- sync or offline stance
- permission boundary
- performance and battery considerations
- platform-specific risk notes

