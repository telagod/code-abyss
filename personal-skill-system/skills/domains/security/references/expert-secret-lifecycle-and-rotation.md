# Expert Secret Lifecycle And Rotation

Use this reference when the main risk lives in how secrets are created, injected, rotated, revoked, and audited.

## Core rules

- secret storage is only one step in the lifecycle
- rotation design should exist before compromise forces it
- secrets should not outlive the authority they protect
- auditability matters for sensitive changes and emergency access

## Strong questions

- where secrets are born
- how they reach workloads
- how rotation happens
- what is revoked after a leak or role change

## Lifecycle rules

- storage is only one step in the secret lifecycle
- rotation design should exist before compromise forces it
- revocation should follow authority change, not only incident response
- auditability should exist for both routine and emergency secret actions

## Output contract

Leave behind:

- lifecycle map
- rotation method
- revocation trigger
- audit trail note
