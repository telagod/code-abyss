# Expert Operating Principles

Use this reference when change analysis must behave like release engineering judgement rather than
just a file counter.

## Core rules

- change risk is about blast radius, not line count alone
- tests and docs should scale with changed contract, not with changed file count
- auth, config, migrations, and execution paths deserve stronger suspicion
- multi-module changes should be treated as integration risk by default

## Strong outputs

A high-value change report should identify:

- changed surface
- sensitive surface
- affected modules
- likely contract movement
- documentation drift risk
- release verification suggestions

