# Auth, Secrets, And Hardening / 认证、密钥与加固

## 1. Separate Authentication And Authorization

Authentication asks who.
Authorization asks what they may do.

Do not treat a valid identity as permission.

## 2. Secrets Hygiene

- avoid long-lived static secrets where possible
- define rotation owner
- define revocation path
- define exposure response

## 3. Hardening Basics

- least privilege
- deny by default
- explicit allowlists
- defense in depth
- security logs for sensitive actions

## 4. Review Questions

- what identity is assumed
- what permission boundary is enforced
- where are secrets stored and rotated
- what happens on credential compromise
