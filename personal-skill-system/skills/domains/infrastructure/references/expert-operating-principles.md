# Expert Operating Principles

Use this reference when the problem is platform-grade infrastructure rather than local setup.

## Order of judgement

1. desired state owner
2. control-plane boundaries
3. identity and secret flow
4. tenancy and isolation
5. rollout and rollback
6. drift and policy enforcement

## Core rules

- declarative state wins over hand-edited environments
- identity is infrastructure, not an application footnote
- multi-environment topology should be explicit before tool choice
- drift control is as important as initial provisioning
- platform primitives should make the safe path easier than the unsafe one

## Design questions

- what is the source of desired truth
- where can drift appear
- who can mutate runtime state
- how are secrets injected and rotated
- what is shared versus isolated across environments

## Output contract

Leave behind:

- topology
- source-of-truth model
- identity and secret flow
- rollout and rollback controls
- drift detection path
- operational blast-radius notes

