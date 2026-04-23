# Portability And Governance

## Portability bar

A portable skill bundle should survive copy-paste without hidden dependency on:

- sibling folders outside the bundle
- host-only runtime assumptions
- undocumented generators
- external references required at answer time

## Generated artifact rules

Keep generated artifacts for:

- registry index
- route map
- host capability map
- source-to-target integration records

Generated files should describe the bundle honestly, not a partial subset.

## Pack rules

Use packs to separate:

- baseline reusable core
- project-specific overlays
- private work assets
- unstable experiments

Do not use packs as a substitute for clear routing.

## Governance loop

For every serious iteration:

1. change the structural source
2. update generated metadata
3. validate consistency
4. record the new design assumption

If metadata drifts from the real skill set, the bundle becomes untrustworthy.
