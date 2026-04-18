# Expert Operating Principles

Use this reference when the repair must be small, safe, and durable rather than merely fast.

## Order of judgement

1. confirmed cause
2. narrowest safe change
3. contract preservation
4. regression surface
5. verification depth
6. residual risk

## Core rules

- no fix without a cause model
- prefer boundary repair over broad internal rewrites
- the smallest diff is only good if it actually removes the failure mode
- every bugfix should decide whether to add a regression test
- if the fix expands scope, name the reason explicitly

## Failure modes

Watch for:

- symptom patching with the real cause still alive
- stealth refactors hiding inside a bugfix
- unchanged tests for changed behavior
- fixing one code path while leaving sibling paths broken
- restoring green checks without restoring correctness

## Escalation rules

Escalate the fix when:

- the bug reveals a broken boundary rather than a typo
- duplicate failures exist in several call sites
- the public contract is already inconsistent
- operational risk is higher than local simplicity

## Output contract

Leave behind:

- cause
- fix boundary
- what stayed unchanged
- verification scope
- regression protection
- remaining risk
