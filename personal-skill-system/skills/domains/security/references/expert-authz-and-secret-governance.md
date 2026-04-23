# Expert Authz And Secret Governance

Use this reference when security design is being constrained by identity and secret flow.

## Core rules

- authn and authz are different control planes
- least privilege must be visible in roles or policies
- secret creation, injection, rotation, and revocation are one lifecycle

## Watch for

- implicit admin paths
- broad service credentials shared across boundaries
- no audit path for sensitive permission changes

