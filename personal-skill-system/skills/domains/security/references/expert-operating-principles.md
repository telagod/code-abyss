# Expert Operating Principles

Use this reference when the task needs stronger security judgement than a checklist pass.

## Order of judgement

1. assets worth protecting
2. trust boundaries
3. attacker capability
4. source-to-sink path
5. blast radius
6. detection and recovery

## Core rules

- every critical finding should name a concrete exploit path
- authn and authz failures are different bugs
- secrets handling is a lifecycle problem, not just a storage problem
- input validation without output handling is incomplete
- least privilege must be visible in the design, not assumed

## High-value review questions

- what untrusted data enters the system
- where can that data change execution or access
- what authority is implicitly inherited
- what happens if one credential leaks
- how is abuse detected after prevention fails

## Strong default outputs

Leave behind:

- boundary map
- likely attack paths
- exploitability judgement
- severity with reason
- compensating controls
- validation or hardening next steps

