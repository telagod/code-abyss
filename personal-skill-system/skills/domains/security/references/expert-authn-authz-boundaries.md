# Expert Authn And Authz Boundaries

Use this reference when the security design problem is really about identity and permission boundaries.

## Core rules

- authentication and authorization are different control planes
- least privilege must be visible in roles, scopes, or policies
- permission boundaries should align with system boundaries, not accidental implementation seams
- broad shared credentials hide real authority flow

## Strong questions

- who or what is authenticated
- where authorization is enforced
- what permission boundary actually protects the asset
- where implicit admin behavior exists

## Boundary rules

- authentication and authorization should not share a hand-wavy boundary
- least privilege should be inspectable in scopes, roles, or policies
- implicit elevation paths are design failures, not minor smells
- permission checks should align with actual asset boundaries

## Output contract

Leave behind:

- authn surface
- authz boundary
- least-privilege gap
- implicit-admin risk
