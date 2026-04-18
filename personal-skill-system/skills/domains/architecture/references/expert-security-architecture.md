# Expert Security Architecture

Use this reference when architecture choices must reflect trust boundaries and defensive posture.

## Security layers

Cover:

- application security
- data security
- infrastructure security

## Questions

- where does untrusted data enter
- where can it alter execution or access
- how are identities verified
- how are permissions enforced
- where are secrets created, injected, rotated, and audited
- what sensitive data needs masking or encryption

## Strong defaults

- authn separate from authz
- least privilege
- encryption in transit and at rest
- explicit audit logging
- no implicit trust of internal boundaries

