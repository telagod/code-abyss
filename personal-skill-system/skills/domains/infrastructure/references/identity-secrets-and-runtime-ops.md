# Identity, Secrets, And Runtime Ops / 身份、密钥与运行治理

## 1. Identity Before Access

Do not start from permissions tables. Start from identities:

- human operator
- CI/CD actor
- workload identity
- external integration

Then define what each identity may do.

## 2. Secrets Rules

- do not store secrets in plain config by default
- define rotation ownership
- define bootstrap path
- define revocation path
- keep audit trail for sensitive changes

## 3. Runtime Governance

Operational rules should cover:

- who may deploy
- who may rollback
- who may exec into workloads
- who may view secrets
- who may alter production config

## 4. Safety Controls

- separate read and write credentials
- prefer short-lived credentials
- prefer workload identity over static tokens
- require explicit break-glass procedure for production emergency access

## 5. Review Questions

- which identities are long-lived
- where are secrets sourced
- how is rotation tested
- what is the emergency revocation path
- who can mutate production at runtime
