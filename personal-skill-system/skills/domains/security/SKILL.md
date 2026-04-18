---
schema-version: 2
name: security
title: Security Domain
description: Security, trust boundaries, vulnerability patterns, secrets handling, auth, and hardening. Use when the task is about exploitability, audit, attack surface, auth, or defensive design.
kind: domain
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [security, audit, vulnerability, auth, secrets]
negative-keywords: [visual design]
priority: 82
runtime: knowledge
executor: none
permissions: [Read, Grep, Bash]
risk-level: high
supported-hosts: [codex, claude, gemini]
status: stable
owner: self
last-reviewed: 2026-04-17
review-cycle-days: 45
tags: [domain, security]
aliases: [sec]
---

# Security Domain

## Use This When

- the task touches trust boundaries
- the task handles user input, command execution, auth, tokens, or secrets
- the user explicitly asks for audit, exploitability, or hardening

## Quick Judgement

- source -> sink reasoning
- authn/authz separation
- secrets hygiene
- input validation and output encoding
- safe defaults and least privilege

## Read These References

- `references/trust-boundaries-and-audit.md`
  Read when reviewing source-to-sink paths, entry points, or attack surfaces.
- `references/common-vulnerability-patterns.md`
  Read when the task touches injection, deserialization, path traversal, SSRF, or XSS-like bug classes.
- `references/auth-secrets-and-hardening.md`
  Read when the issue involves identity, permission boundaries, token handling, or operational hardening.
- `references/expert-operating-principles.md`
  Read when the task needs stronger exploit-path reasoning, severity judgement, or defensive design posture.
- `references/expert-authz-and-secret-governance.md`
  Read when the security problem is really identity, permission, secret lifecycle, or audit governance.
- `references/expert-authn-authz-boundaries.md`
  Read when the key risk is weak authn or authz boundary definition.
- `references/expert-secret-lifecycle-and-rotation.md`
  Read when secret creation, rotation, revocation, or auditability are the weak link.
- `references/expert-defense-in-depth-architecture.md`
  Read when the question is architectural defense-in-depth rather than only a single bug class.
- `references/expert-layered-controls-and-trust-zones.md`
  Read when the key issue is trust zones and whether defensive layers fail independently.
- `references/expert-detection-response-and-recovery.md`
  Read when the main weakness is what happens after prevention fails.

## Route onward

- explicit scan -> `verify-security`
- fix a confirmed issue -> `bugfix`
- design secure boundaries -> `architecture-decision`
